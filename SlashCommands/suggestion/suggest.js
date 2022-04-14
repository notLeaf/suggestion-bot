const {
    MessageActionRow,
    MessageButton
} = require("discord.js");
const {
    genID,
    randomHex
} = require("../../handler/functions")
const {
    fail,
    success,
    thumbsup,
    thumbsdown
} = require('../../config.json');
const suggestions = require("../../models/suggestion");
const server = require('../../models/config');

module.exports = {
    name: "suggest",
    description: "send a suggestion",
    clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
    options: [{
        name: 'content',
        description: 'the suggestion',
        type: 'STRING',
        required: true
    }],

    run: async (client, interaction) => {

        let data = await server.findById(interaction.guildId);

        if (!data || !data.channel.suggestions)
            return interaction.followUp({
                content: `${fail} The suggestions channel is not configured`,
            });

        const channelId = data.channel.suggestions;
        const channel = (await interaction.guild.channels.fetch(channelId).catch(() => null));

        if (!channel)
            return interaction.followUp({
                content: `${fail} The suggestions channel was not found`,
            });

        const content = interaction.options.getString('content');
        let id = genID(8);

        while (await suggestions.findById(id)) {
            id = genID(8);
        }

        const upBtn = new MessageButton({
            customId: `sug-${id}-yes`,
            label: '0',
            style: 'SUCCESS',
            emoji: `${thumbsup}`
        });

        const downBtn = new MessageButton({
            customId: `sug-${id}-no`,
            label: '0',
            style: 'DANGER',
            emoji: `${thumbsdown}`
        });

        const row = new MessageActionRow({
            components: [upBtn, downBtn]
        });

        const message = await channel.send({
            embeds: [{
                color: randomHex(),
                description: content,
                fields: [{
                    name: 'Status: Pending',
                    value: 'Waiting for community feedback'
                }],
                author: {
                    name: `Suggestion by ${interaction.user.tag}`,
                    iconURL: interaction.member.displayAvatarURL({
                        dynamic: true
                    })
                },
                footer: {
                    text: `ID: ${id}`
                },
                timestamp: Date.now(),
                thumbnail: {
                    url: interaction.member.displayAvatarURL({
                        dynamic: true
                    })
                }
            }],
            components: [row]
        });

        await new suggestions({
            _id: id,
            messageId: message.id
        }).save();

        interaction.followUp({
            content: `${success} Your suggestion has been submitted! [ ${channel} ]`
        });
    }
};
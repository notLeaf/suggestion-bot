const {
    MessageActionRow,
} = require("discord.js");
const {
    fail,
    success
} = require("../../config.json");
const suggestions = require("../../models/suggestion");
const server = require('../../models/config');

module.exports = {
    name: "reply",
    description: "reply to a suggestion",
    clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
    userPermissions: ['MANAGE_MESSAGES'],
    options: [{
            name: 'id',
            description: 'id of the suggestion',
            type: 'STRING',
            required: true
        },
        {
            name: 'action',
            description: 'choose an action',
            type: 'STRING',
            required: true,
            choices: [{
                    name: 'accept',
                    value: 'accept'
                },
                {
                    name: 'deny',
                    value: 'deny'
                }
            ]
        },
        {
            name: 'reason',
            description: 'provide a reason',
            type: 'STRING',
            required: true
        }
    ],

    run: async (client, interaction) => {

        const id = interaction.options.getString('id');
        const action = interaction.options.getString('action')
        const reason = interaction.options.getString('reason');

        const data = await server.findById(interaction.guildId);
        
        if (!data || !data.channel.suggestions)
            return interaction.followUp({
                content: `${fail} The suggestions channel is not configured`,
            });

        const channel = (await interaction.guild.channels.fetch(data.channel.suggestions).catch(() => null));

        if (!channel)
            return interaction.followUp({
                content: `${fail} The suggestions channel was not found`,
            });

        const sugg = await suggestions.findById(id);

        if (!sugg)
            return interaction.followUp({
                content: `${fail} Invalid suggestion ID provided`,
            });

        const message = (await channel.messages.fetch(sugg.messageId).catch(() => null));

        if (!message)
            return interaction.followUp({
                content: `${fail} I cant find this suggestion maybe it has been deleted`
            });

        if (!message.editable)
            return interaction.followUp({
                content: `${fail} I cant edit this suggestion`
            });

        if (sugg.status.mode != 'Pending')
            return interaction.followUp({
                content: `${fail} The suggestion has already been answered`,
            });

        const components = message.components[0].components.map(b => b.setDisabled(true));
        const row = new MessageActionRow({
            components
        });

        message.edit({
            components: [row],
            embeds: [
                message.embeds[0].setColor(action == 'accept' ? 'GREEN' : 'RED').setFields([{
                    name: `Status: ${action == 'accept' ? 'Accepted' : 'Rejected'} by ${interaction.user.tag}`,
                    value: `${reason}`
                }])
            ]
        });

        sugg.status.mode = action == 'accept' ? 'Accepted' : 'Rejected';
        sugg.status.reason = reason;

        await sugg.save();
        return interaction.followUp({
            content: `${success} Suggestion successfully edited`
        });
    }
};
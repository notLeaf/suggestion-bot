const {
    fail,
    success
} = require('../../config.json');
const server = require('../../models/config');

module.exports = {
    name: "setsuggestions",
    description: "configure the suggestion system.",
    clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY'],
    userPermissions: ['ADMINISTRATOR'],
    options: [{
        name: 'channel',
        description: 'mention a channel or leave empty to remove it',
        type: 'CHANNEL',
        channelTypes: ['GUILD_NEWS', 'GUILD_TEXT'],
        required: false
    }],

    run: async (client, interaction) => {

        let data = await server.findById(interaction.guildId);

        if (!data) data = new server({
            _id: interaction.guildId
        });

        const channel = interaction.options.getChannel('channel')

        if (!channel) {
            if (!data.channel.suggestions)
                return interaction.followUp({
                    content: `${fail} No configuration found, mention a channel to set the suggestion system`,
                    ephemeral: true
                });

            data.channel.suggestions = null;
            await data.save();

            return interaction.followUp({
                content: `${success} The suggestion system has been successfully disabled`
            });
        }

        if (channel.id == data.channel.suggestions)
            return interaction.followUp({
                content: `${fail} This is already the suggestion channel`,
            });

        data.channel.suggestions = channel.id;
        await data.save();

        return interaction.followUp({
            content: `${success} The suggestion channel has been successfully set up [ ${channel} ]`
        });
    }
};
const {
    MessageEmbed,
    CommandInteraction,
    Client
} = require("discord.js");
const {
    randomHex
} = require("../../handler/functions");

module.exports = {
    name: "ping",
    description: "websocket ping",

    run: async (client, interaction) => {

        await interaction.editReply({
            content: "Pinging.."
        }).then(async () => {
            const ping = Date.now() - interaction.createdAt;
            const api_ping = client.ws.ping;

            await interaction.editReply({
                content: "**🏓 Pong**",
                embeds: [new MessageEmbed().setColor(randomHex()).addFields([{
                    name: "Bot Latency",
                    value: `\`\`\`ini\n[ ${ping}ms ]\n\`\`\``,
                    inline: true
                }, {
                    name: "API Latency",
                    value: `\`\`\`ini\n[ ${api_ping}ms ]\n\`\`\``,
                    inline: true
                }]).setTimestamp()]
            });
        })
    }
}
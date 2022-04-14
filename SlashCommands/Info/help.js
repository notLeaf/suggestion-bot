const {
    MessageEmbed,
} = require("discord.js");
const {
    randomHex
} = require("../../handler/functions")

module.exports = {
    name: "help",
    description: "help command",

    run: async (client, interaction) => {

        const embed = new MessageEmbed()
            .setTitle(`${client.user.username}'s commands`)
            .addField('Config command', '\`setsuggestions\`')
            .addField('Info commands', '\`help\`, \`ping\`')
            .addField('Suggestion commands', '\`suggest\`, \`reply\`')
            .addField('Bot name', `\`${client.user.username}\``, true)
            .addField('Discriminator', `\`#${client.user.discriminator}\``, true)
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(randomHex())

        await interaction.followUp({
            embeds: [embed]
        })
    },
};
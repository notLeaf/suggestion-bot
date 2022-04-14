const client = require("../index");
const {
    MessageActionRow
} = require("discord.js");
const { fail, success } = require('../config.json');
const suggestions = require("../models/suggestion");
const server = require('../models/config');

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd)
            return interaction.followUp({ content: "An error has occured " });

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        if (!interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) {
            return interaction.followUp({
                content: 'The \`@everyone\` role is missing the Permission to \`USE_EXTERNAL_EMOJIS\`, enable it'
            })
        }

        if (!interaction.member.permissions.has(cmd.userPermissions || [])) {
            return interaction.followUp({
                content: `${fail} You need \`${cmd.userPermissions.join(", ")}\` Permissions`
            })
        }

        if (!interaction.guild.me.permissions.has(cmd.clientPermissions || [])) {
            return interaction.followUp({
                content: `${fail} I need \`${cmd.clientPermissions.join(", ")}\` Permissions`
            })
        }

        cmd.run(client, interaction, args);
    }

    if (!interaction.isButton() || !interaction.customId.startsWith('sug-')) return;
      await interaction.deferReply({
          ephemeral: true
      });
  
      let data = await server.findById(interaction.guildId);
  
      if (!data || !data.channel.suggestions)
          return interaction.followUp({
              content: `${fail} The suggestions channel is not configured`,
          });
  
      const id = interaction.customId.replace('sug-', '').substring(0, 8);
      const sugg = await suggestions.findById(id);
  
      if (!sugg)
          return interaction.followUp({
              content: `${fail} the suggestion has been deleted from the database`,
              ephemeral: true
          });
  
      const channel = (await interaction.guild.channels.fetch(data.channel.suggestions).catch(() => null));
  
      if (!channel)
          return interaction.followUp({
              content: `${fail} The suggestions channel was not found`,
              ephemeral: true
          });
  
      const message = (await channel.messages.fetch(sugg.messageId).catch(() => null));
  
      if (!message)
          return interaction.followUp({
              content: `${fail} I cant find this suggestion maybe it has been deleted`,
              ephemeral: true
          });
          
      const action = interaction.customId.replace(`sug-${id}-`, '') == 'yes' ? 'upvote' : 'downvote';
      const find = sugg.answers.find(x => x.id == interaction.user.id);
  
      if (find) {
          if (action == find.type)
              return interaction.followUp({
                  content: `${fail} You have already voted this suggestion`,
                  ephemeral: true
              });
  
          sugg.answers = sugg.answers.map(item => {
              if (item.id == interaction.user.id) return {
                  ...item,
                  type: action
              };
              else return item;
          });
  
          if (action == 'downvote') sugg.votes.up -= 1
          else sugg.votes.down -= 1
      } else
          sugg.answers.push({
              id: interaction.user.id,
              type: action
          });
  
      if (action == 'downvote') sugg.votes.down += 1;
      else sugg.votes.up += 1;
  
      const btnUp = message.components[0].components[0];
      const btnDown = message.components[0].components[1];
  
      btnUp.setLabel(`${sugg.votes.up}`);
      btnDown.setLabel(`${sugg.votes.down}`);
  
      await sugg.save();
      message.edit({
          components: [new MessageActionRow({
              components: [btnUp, btnDown]
          })]
      });
  
      return interaction.followUp({
          content: `${success} Your vote has been counted`,
          ephemeral: true
      });
});
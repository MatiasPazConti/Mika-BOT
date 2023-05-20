const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const Reports = require("../../models/Reports");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = {
  name: "report-set-channel",
  description: "Descripción",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      let reports = await Reports.findOne({
        guildId: interaction.guild.id,
      });

      if (reports) {
        if (reports.discordChannelId === interaction.channel.id) {
          interaction.editReply({
            content:
              "Reports has already been setted for this channel. To disable run '/report-disable'.",
            ephemeral: true,
          });
          return;
        }

        reports.discordChannelId = interaction.channel.id;
        reports.reportsEnabled = true;
      } else {
        reports = new Reports({
          guildId: interaction.guild.id,
          discordChannelId: interaction.channel.id,
          reportsEnabled: true,
          reportId: 1,
        });
      }

      await reports.save();
      interaction.editReply({
        content:
          "Report channel has been setted. To disable run '/report-disable'.",
        ephemeral: true,
      });
    } catch (error) {
      console.log(`There was an error setting the Report Channel:\n${error}`);
    }
  },
};

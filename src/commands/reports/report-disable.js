const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const Reports = require("../../models/Reports");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = {
  name: "report-disable",
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

      const reports = await Reports.findOne({
        guildId: interaction.guild.id,
      });

      if (reports?.reportsEnabled) {
        reports.reportsEnabled = false;
        reports.save();

        interaction.editReply({
          content:
            "Reports has been disabled. To set a new report channel run '/report-set-channel'.",
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          "Reports has already been disabled. To set a new report channel run '/report-set-channel'.",
        ephemeral: true,
      });
    } catch (error) {
      console.log(`There was an error disabling the reports:\n${error}`);
    }
  },
};

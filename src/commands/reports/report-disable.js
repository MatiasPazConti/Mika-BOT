const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const Report = require("../../models/Report");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = {
  name: "report-disable",
  description: "Deshabilita el canal de reportes y el comando '/report'.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      interaction.reply({
        content: "No tienes los permisos suficientes para usar este comando.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const report = await Report.findOne({
        guildId: interaction.guild.id,
      });

      if (report?.enabled) {
        report.enabled = false;
        report.save();

        interaction.editReply({
          content:
            "Se han desabilitado los reportes. Para asignar un nuevo canal de reportes use '/report-set-channel'.",
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          "Los reportes ya están deshabilitados. Para asignar un nuevo canal de reportes use '/report-set-channel'",
        ephemeral: true,
      });
    } catch (error) {
      console.log(`Hubo un error deshabilitando los reportes:\n${error}`);
    }
  },
};

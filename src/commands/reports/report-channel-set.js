const {
  Client,
  Interaction,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const Report = require("../../models/Report");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = {
  name: "report-channel-set",
  description: "En desarrollo",
  options: [
    {
      name: "canal",
      description: "Canal donde se publicarán los reportes.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
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

    const notificationChannelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let report = await Report.findOne({
        guildId: interaction.guild.id,
      });

      if (report?.enabled) {
        if (report.notificationChannelId === notificationChannelId) {
          interaction.editReply({
            content:
              "Este canal ya está asignado como canal de reportes. Para deshabilitarlo use '/report-disable'.",
            ephemeral: true,
          });
          return;
        }

        report.notificationChannelId = notificationChannelId;
        report.enabled = true;
      } else {
        report = new Report({
          enabled: true,
          guildId: interaction.guild.id,
          notificationChannelId: notificationChannelId,
          reportId: 1,
        });
      }

      await report.save();
      interaction.editReply({
        content:
          "Se ha configurado el canal de reportes. Para deshabilitarlo use '/report-disable'.",
        ephemeral: true,
      });
    } catch (error) {
      console.log(`Hubo un error asignado el canal de reportes:\n${error}`);
    }
  },
};

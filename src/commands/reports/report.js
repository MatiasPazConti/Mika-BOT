const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const Report = require("../../models/Report");

const convertId = (value) => {
  let id = value.toString();
  if (value < 10) {
    id = `0000${id}`;
  } else if (value < 100) {
    id = `000${id}`;
  } else if (value < 1000) {
    id = `00${id}`;
  } else if (value < 10000) {
    id = `0${id}`;
  }
  return id;
};

module.exports = {
  name: "report",
  description: "Descripción",
  options: [
    {
      name: "usuario",
      description: "Usuario a reportar.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Causa por la que se le está reportando.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.SendMessages],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      let report = await Report.findOne({
        guildId: interaction.guild.id,
      });

      if (!report?.enabled) {
        interaction.editReply({
          content: "El comando se encuentra deshabilitado para este servidor.",
          ephemeral: true,
        });
        return;
      }

      const reportId = convertId(report.reportId);

      const embed = new EmbedBuilder()
        .setTitle(`REPORT#${reportId}`)
        .setDescription(
          `**Se reporta a**: <@${
            interaction.options.get("usuario").user.id
          }>\n**Motivo**: ${interaction.options.get("motivo").value}`
        )
        .setColor("#F2C4DE");

      client.channels.cache
        .get(report.notificationChannelId)
        .send({ embeds: [embed] });

      report.reportId = report.reportId + 1;
      report.save();

      await interaction.deleteReply();
    } catch (error) {
      console.log(`Hubo un error enviando el reporte:\n${error}`);
    }
  },
};

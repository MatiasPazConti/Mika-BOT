const {
  Client,
  Interaction,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const Reports = require("../../models/Reports");
const idConvert = require("../../utils/idConvert");

/**
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = {
  name: "report",
  description: "Descripción",
  options: [
    {
      name: "offender",
      description: "Descripción",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Descripción",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.SendMessages],
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

      const reportId = idConvert(reports.reportId);

      const embed = new EmbedBuilder()
        .setTitle(`REPORT#${reportId}`)
        .addFields({
          name: `Motivo: ${interaction.options.get("reason").value}`,
          value: `Se reporta a: <@${
            interaction.options.get("offender").user.id
          }>`,
        })
        .setColor(0x00ffff);

      client.channels.cache
        .get(reports.discordChannelId)
        .send({ embeds: [embed] });

      reports.reportId = reports.reportId + 1;
      reports.save();

      await interaction.deleteReply();
    } catch (error) {
      console.log(`There was an error sending the report:\n${error}`);
    }
  },
};

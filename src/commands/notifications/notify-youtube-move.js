const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-move",
  description:
    "Modifica un canal de notificaciones que haya sido registrado previamente.",
  options: [
    {
      name: "id",
      description: "ID del canal de YouTube.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Canal donde se notificará la actividad.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Lo siento, este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    const youtubeId = interaction.options.get("id").value;
    const channelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOne({
        guildId: interaction.guild.id,
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        if (youtubeNotification.discordChannelId === channelId) {
          interaction.editReply({
            content:
              `Las notificaciones de este canal de YouTube ya habían sido asignadas a <#${youtubeNotification.discordChannelId}> previamente.\n` +
              "Para volver a intentar mover el canal de notificaciones de Discord use '/notify-youtube-move'.\n" +
              "Para dejar de notificar las publicaciones de este canal de YouTube use '/notify-youtube-remove'.\n" +
              "Para registrar un nuevo canal de notificaciones use '/notify-youtube-add'.",
            ephemeral: true,
          });
          return;
        }

        youtubeNotification.discordChannelId = channelId;
        await youtubeNotification.save();

        interaction.editReply({
          content:
            `Se ha movido exitosamente el canal de notificaciones a <#${youtubeNotification.discordChannelId}>.\n` +
            "Para volver a mover el canal de notificaciones de Discord use '/notify-youtube-move'.\n" +
            "Para dejar de notificar las publicaciones de este canal de YouTube use '/notify-youtube-remove'.\n" +
            "Para registrar un nuevo canal de notificaciones use '/notify-youtube-add'.",
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          "Lo siento, este canal de YouTube no está registrado.\n" +
          "Para registrar un nuevo canal de notificaciones use '/notify-youtube-add'\n",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/notify-youtube-move':\n${error}`
      );
    }
    return;
  },
};

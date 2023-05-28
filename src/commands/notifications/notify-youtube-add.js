const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-add",
  description:
    "Registra un nuevo canal de YouTube para que se notifiquen sus publicaciones.",
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
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        interaction.editReply({
          content:
            `Las notificaciones para este canal de YouTube ya han sido asignadas a <#${youtubeNotification.discordChannelId}>.\n` +
            "Para mover el canal de notificaciones de Discord use '/notify-youtube-move'.\n" +
            "Para dejar de notificar las publicaciones de este canal de YouTube use '/notify-youtube-remove'.",
          ephemeral: true,
        });
        return;
      }

      youtubeNotification = new YoutubeNotification({
        guildId: interaction.guild.id,
        discordChannelId: channelId,
        youtubeChannelId: youtubeId,
        latestVideoId: "",
      });

      await youtubeNotification.save();
      interaction.editReply({
        content:
          `Se ha registrado exitosamente el nuevo canal de notificaciones en <#${youtubeNotification.discordChannelId}>.\n` +
          "Para mover el canal de notificaciones de Discord use '/notify-youtube-move'.\n" +
          "Para dejar de notificar las publicaciones de este canal de YouTube use '/notify-youtube-remove'.",
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/notify-youtube-add':\n${error}`
      );
    }
  },
};

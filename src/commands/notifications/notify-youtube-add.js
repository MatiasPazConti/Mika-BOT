const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-add",
  description: "En desarrollo.",
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
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    const youtubeId = interaction.options.get("id").value;
    const channelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOne({
        youtubeChannelId: channelId,
      });

      if (youtubeNotification) {
        interaction.editReply({
          content:
            `Este canal de YouTube ya ha sido asignado a <#>.\n` +
            "Para cambiar el canal de Discord donde se publiquen las notificaciones use '/notify-youtube-move'\n" +
            "Para dejar de notificar las publicaciones del canal use '/notify-youtube-remove'.",
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
          "Las notificaciones de YouTube se han configurado exitosamente.\n" +
          "Para cambiar el canal de Discord donde se publiquen las notificaciones use '/notify-youtube-move'\n" +
          "Para dejar de notificar las publicaciones del canal use '/notify-youtube-remove'.",
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.log(
        `Hubo un error realizando las notificaciones de YouTube: ${error}`
      );
    }
  },
};

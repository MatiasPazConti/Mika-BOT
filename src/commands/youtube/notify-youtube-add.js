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
      description: "Canal donde se realizarán las notificaciones.",
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
        interaction.editReply({
          content:
            `Las notificaciones para el canal de YouTube **${youtubeId}** ya están asignadas a <#${youtubeNotification.discordChannelId}>.\n` +
            "Para mover el canal de notificaciones de Discord, use el comando **/notify-youtube-move**.\n",
          ephemeral: true,
        });
        return;
      }

      youtubeNotification = new YoutubeNotification({
        guildId: interaction.guild.id,
        discordChannelId: channelId,
        youtubeChannelId: youtubeId,
      });
      await youtubeNotification.save();

      interaction.editReply({
        content:
          `Se ha registrado exitosamente el canal de Youtube **${youtubeId}**.\n` +
          `Las notificaciones se realizarán en <#${channelId}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /notify-youtube-add\n${error}`
      );
    }
  },
};

const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-message",
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
      name: "mensaje",
      description: "Mensaje personalizado que se usará en la notificación.",
      type: ApplicationCommandOptionType.String,
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
    const msgContent = interaction.options.get("mensaje").value;

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOne({
        guildId: interaction.guild.id,
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        youtubeNotification.messageContent = msgContent;
        await youtubeNotification.save();

        interaction.editReply({
          content:
            `Se ha modificado exitosamente el mensaje de las notificaciones del canal de YouTube **${youtubeId}** como:\n` +
            `${msgContent}`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, el canal YouTube **${youtubeId}** no se encuentra registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando **/notify-youtube-add**.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(`Hubo un error con el comando: /welcome-message\n${error}`);
    }
  },
};

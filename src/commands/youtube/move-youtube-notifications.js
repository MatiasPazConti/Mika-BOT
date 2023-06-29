const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "move-youtube-notifications",
  description: "Mueve las notificaciones a un nuevo canal de Discord.",
  options: [
    {
      name: "id",
      description: "ID del canal de YouTube.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Nuevo canal donde se notificará.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (interaction, client) => {
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
            content: `Las notificaciones de YouTube para **${youtubeId}** ya están asignadas a <#${youtubeNotification.discordChannelId}>.`,
            ephemeral: true,
          });
          return;
        }

        youtubeNotification.discordChannelId = channelId;
        await youtubeNotification.save();

        interaction.editReply({
          content:
            "Se ha modificado exitosamente el canal de notificaciones.\n" +
            `Las notificaciones de YouTube para **${youtubeId}** se realizarán en <#${channelId}>.`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, el canal YouTube **${youtubeId}** no se encuentra registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando ``/add-youtube-notifications``.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /move-youtube-notifications\n${error}`
      );
    }
    return;
  },
};

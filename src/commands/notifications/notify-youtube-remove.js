const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-remove",
  description:
    "Elimina un canal de notificaciones que haya sido registrado previamente. [En desarrollo]",
  options: [
    {
      name: "id",
      description: "ID del canal de YouTube.",
      type: ApplicationCommandOptionType.String,
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

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOneAndRemove({
        guildId: interaction.guild.id,
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        interaction.editReply({
          content:
            "Se han quitado las notificaciones para este canal de YouTube.\n" +
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
        `Hubo un error con el comando '/notify-youtube-remove':\n${error}`
      );
    }
    return;
  },
};

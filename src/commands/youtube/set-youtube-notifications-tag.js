const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "set-youtube-notifications-tag",
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
      name: "rol",
      description: "Rol que se mencionará en las notificaciones.",
      type: ApplicationCommandOptionType.Role,
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
    const roleId = interaction.options.get("rol").value;

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOne({
        guildId: interaction.guild.id,
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        if (youtubeNotification.tagRoleId) {
          if (youtubeNotification.tagRoleId === roleId) {
            interaction.editReply({
              content: `El rol <@&${roleId}> ya estaba asignado para las notificaciones de **${youtubeId}**`,
              ephemeral: true,
            });
            return;
          }
        }

        youtubeNotification.tagRoleId = roleId;
        await youtubeNotification.save();

        interaction.editReply({
          content: `Se ha asignado exitosamente el rol <@&${roleId}> como rol de notificaciones de YouTube para **${youtubeId}**.`,
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
        `Hubo un error con el comando: /set-youtube-notifications-tag\n${error}`
      );
    }
  },
};

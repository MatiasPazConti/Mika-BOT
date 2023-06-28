const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");

module.exports = {
  name: "set-twitch-notifications-tag",
  description:
    "Registra un nuevo canal de Twitch para que se notifiquen sus publicaciones.",
  options: [
    {
      name: "id",
      description: "ID del canal de Twitch.",
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

    const twitchId = interaction.options.get("id").value;
    const roleId = interaction.options.get("rol").value;

    try {
      await interaction.deferReply();

      let twitchNotification = await TwitchNotification.findOne({
        guildId: interaction.guild.id,
        twitchChannelId: twitchId,
      });

      if (twitchNotification) {
        if (twitchNotification.tagRoleId) {
          if (twitchNotification.tagRoleId === roleId) {
            interaction.editReply({
              content: `El rol <@&${roleId}> ya estaba asignado para las notificaciones de **${twitchId}**`,
              ephemeral: true,
            });
            return;
          }
        }

        twitchNotification.tagRoleId = roleId;
        await twitchNotification.save();

        interaction.editReply({
          content: `Se ha asignado exitosamente el rol <@&${roleId}> como rol de notificaciones de Twitch para **${twitchId}**.`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, el canal Twitch **${twitchId}** no se encuentra registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando ``/add-twitch-notifications``.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /set-twitch-notifications-tag\n${error}`
      );
    }
  },
};

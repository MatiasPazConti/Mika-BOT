const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");

module.exports = {
  name: "add-twitch-notifications",
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
      name: "canal",
      description: "Canal donde se notificará.",
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

    const twitchId = interaction.options.get("id").value;
    const channelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let twitchNotification = await TwitchNotification.findOne({
        guildId: interaction.guild.id,
        twitchChannelId: twitchId,
      });

      if (twitchNotification) {
        interaction.editReply({
          content:
            `Las notificaciones de Twitch para **${twitchId}** ya están asignadas a <#${twitchNotification.discordChannelId}>.\n` +
            "Para mover el canal de notificaciones, use el comando ``/move-twitch-notifications``.\n",
          ephemeral: true,
        });
        return;
      }

      twitchNotification = new TwitchNotification({
        guildId: interaction.guild.id,
        discordChannelId: channelId,
        twitchChannelId: twitchId,
      });
      await twitchNotification.save();

      interaction.editReply({
        content:
          `Se ha registrado exitosamente el canal de Twitch: **${twitchId}**.\n` +
          `Las notificaciones se realizarán en <#${channelId}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /add-twitch-notifications\n${error}`
      );
    }
  },
};

const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");

module.exports = {
  name: "move-twitch-notifications",
  description: "Mueve las notificaciones a un nuevo canal de Discord.",
  options: [
    {
      name: "id",
      description: "ID del canal de Twitch.",
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
        if (twitchNotification.discordChannelId === channelId) {
          interaction.editReply({
            content: `Las notificaciones de Twitch para **${twitchId}** ya están asignadas a <#${twitchNotification.discordChannelId}>.`,
            ephemeral: true,
          });
          return;
        }

        twitchNotification.discordChannelId = channelId;
        await twitchNotification.save();

        interaction.editReply({
          content:
            "Se ha modificado exitosamente el canal de notificaciones.\n" +
            `Las notificaciones de Twitch para **${twitchId}** se realizarán en <#${channelId}>.`,
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
        `Hubo un error con el comando: /move-twitch-notifications\n${error}`
      );
    }
    return;
  },
};

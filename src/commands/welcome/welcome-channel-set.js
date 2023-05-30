const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");
const Welcome = require("../../models/Welcome");

module.exports = {
  name: "welcome-channel-set",
  description: "Asigna el canal de auto-mensajes de bienvenida.",
  options: [
    {
      name: "canal",
      description: "Canal donde se enviarán los mensajes de bienvenida.",
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

    const channelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let welcome = await Welcome.findOne({
        guildId: interaction.guild.id,
      });

      if (welcome) {
        if (welcome.discordChannelId === channelId) {
          interaction.editReply({
            content:
              `Los auto-mensajes de bienvenida ya habían sido asignados a <#${welcome.discordChannelId}> previamente.\n` +
              "Para cambiar el canal de auto-mensajes vuelva a usar '/welcome-channel-set'.\n" +
              "Para quitar los auto-mensajes de bienvenida use '/welcome-channel-remove'.",
            ephemeral: true,
          });
          return;
        }
        welcome.discordChannelId = channelId;
        await welcome.save();

        interaction.editReply({
          content:
            `Los auto-mensajes de bienvenida ya habían sido asignados a <#${welcome.discordChannelId}> previamente.\n` +
            "Para cambiar el canal de auto-mensajes vuelva a usar '/welcome-channel-set'.\n" +
            "Para quitar los auto-mensajes de bienvenida use '/welcome-channel-remove'.",
          ephemeral: true,
        });
        return;
      }

      welcome = new Welcome({
        guildId: interaction.guild.id,
        discordChannelId: channelId,
      });
      await welcome.save();

      interaction.editReply({
        content:
          `El nuevo canal auto-mensajes de bienvenida <#${channelId}> se ha configurado exitosamente.\n` +
          "Para cambiar el canal de auto-mensajes vuelva a usar '/welcome-channel-set'.\n" +
          "Para quitar los auto-mensajes de bienvenida use '/welcome-channel-remove'.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/welcome-channel-set':\n${error}`
      );
    }
  },
};

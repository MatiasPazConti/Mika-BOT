const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");
const ServerBoost = require("../../models/ServerBoost");

module.exports = {
  name: "set-boost-channel",
  description: "Asigna el canal de auto-mensajes de agradecimiento.",
  options: [
    {
      name: "canal",
      description: "Canal donde se enviarán los mensajes de agradecimiento.",
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

    const channelId = interaction.options.get("canal").value;

    try {
      await interaction.deferReply();

      let serverBoost = await ServerBoost.findOne({
        guildId: interaction.guild.id,
      });

      if (serverBoost) {
        if (serverBoost.discordChannelId === channelId) {
          interaction.editReply({
            content:
              `Los auto-mensajes de agradecimiento ya habían sido asignados a <#${serverBoost.discordChannelId}> previamente.\n` +
              "Para cambiar el canal de auto-mensajes vuelva a usar '/set-boost-channel'.\n" +
              "Para quitar los auto-mensajes de agradecimiento use '/remove-boost-channel'.",
            ephemeral: true,
          });
          return;
        }
        serverBoost.discordChannelId = channelId;
        await serverBoost.save();

        interaction.editReply({
          content:
            `Los auto-mensajes de agradecimiento ya habían sido asignados a <#${serverBoost.discordChannelId}> previamente.\n` +
            "Para cambiar el canal de auto-mensajes vuelva a usar '/set-boost-channel'.\n" +
            "Para quitar los auto-mensajes de agradecimiento use '/remove-boost-channel'.",
          ephemeral: true,
        });
        return;
      }

      serverBoost = new ServerBoost({
        guildId: interaction.guild.id,
        discordChannelId: channelId,
      });
      await serverBoost.save();

      interaction.editReply({
        content:
          `El nuevo canal auto-mensajes de agradecimiento <#${channelId}> se ha configurado exitosamente.\n` +
          "Para cambiar el canal de auto-mensajes vuelva a usar '/set-boost-channel'.\n" +
          "Para quitar los auto-mensajes de agradecimiento use '/remove-boost-channel'.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/set-boost-channel':\n${error}`
      );
    }
  },
};

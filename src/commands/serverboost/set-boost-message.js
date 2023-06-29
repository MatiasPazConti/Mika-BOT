const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");
const ServerBoost = require("../../models/ServerBoost");

module.exports = {
  name: "set-boost-message",
  description: "Modifica la descripción del auto-mensaje de agradecimiento.",
  options: [
    {
      name: "mensaje",
      description:
        "Mensaje personalizado que se usará en el embed de bienvenida.",
      type: ApplicationCommandOptionType.String,
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

    const thanksMsg = interaction.options.get("mensaje").value;

    try {
      await interaction.deferReply();

      let serverBoost = await ServerBoost.findOne({
        guildId: interaction.guild.id,
      });

      if (serverBoost) {
        serverBoost.thanksMessage = thanksMsg;
        await serverBoost.save();

        interaction.editReply({
          content:
            `Se ha modificado exitosamente el mensaje de agradecimiento:\n` +
            `${thanksMsg}`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, no hay ningún canal de bienvenida registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando ``/set-boost-channel``.",
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/set-boost-message':\n${error}`
      );
    }
  },
};

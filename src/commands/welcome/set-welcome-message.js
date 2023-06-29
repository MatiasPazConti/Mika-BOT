const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");
const Welcome = require("../../models/Welcome");

module.exports = {
  name: "set-welcome-message",
  description: "Modifica la descripción del auto-mensaje de bienvenida.",
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

    const welcomeMsg = interaction.options.get("mensaje").value;

    try {
      await interaction.deferReply();

      let welcome = await Welcome.findOne({
        guildId: interaction.guild.id,
      });

      if (welcome) {
        welcome.welcomeMessage = welcomeMsg;
        await welcome.save();

        interaction.editReply({
          content:
            `Se ha modificado exitosamente el mensaje de bienvenida a:\n` +
            `¡Bienvenido/a ${interaction.member}, soy <@1108378229439483945>!\n` +
            `${welcomeMsg}`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, no hay ningún canal de bienvenida registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando ``/set-welcome-channel``.",
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/set-welcome-message':\n${error}`
      );
    }
  },
};

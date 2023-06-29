const { Client, Interaction, PermissionFlagsBits } = require("discord.js");
const Welcome = require("../../models/Welcome");

module.exports = {
  name: "remove-welcome-channel",
  description: "Asigna el canal de auto-mensajes de bienvenida.",
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

    try {
      await interaction.deferReply();

      let welcome = await Welcome.findOneAndRemove({
        guildId: interaction.guild.id,
      });

      if (welcome) {
        interaction.editReply({
          content:
            "Se han quitado los auto-mensajes de bienvenida.\n" +
            "Para asignar un nuevo canal de auto-mensajes use '/welcome-channel-set'.",
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, no hay ningún canal de auto-mensajes de bienvenida registrado.\n` +
          "Para asignar un nuevo canal de auto-mensajes use '/welcome-channel-set'.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando '/welcome-channel-set':\n${error}`
      );
    }
  },
};

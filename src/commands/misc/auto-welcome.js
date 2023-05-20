const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "auto-welcome",
  description: "Enables the bot's automatic welcome for new members.",
  options: [
    {
      name: "enable",
      description: "Enables/disables the auto-welcome for this server.",
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }
  },
};

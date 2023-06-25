const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  MessageEmbed,
} = require("discord.js");

module.exports = {
  name: "add-embed-field",
  description: "Descripción",
  options: [
    {
      name: "canal",
      description: "Ingrese el canal con el Embed a modificar.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "mensaje",
      description: "Ingrese el ID del mensaje con el Embed a modificar.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "título",
      description: "Ingrese el título de la nueva sección.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "descripción",
      description: "Ingrese la descripción de la nueva sección.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const channelId = interaction.options.get("canal").value;
      const messageId = interaction.options.get("mensaje");
      const fieldTitle = interaction.options.get("título");
      const fieldDescription = interaction.options.get("descripción");

      const channel = client.channels.cache.get(channelId);
      const message = await channel.messages.fetch(messageId);
      const embed = message.embeds[0];
      embed.addField(fieldTitle, fieldDescription);

      message.edit({ embeds: [embed] });

      await interaction.deleteReply();
    } catch (error) {
      console.log(`Hubo un error enviando el Embed:\n${error}`);
    }
  },
};
const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const Canvas = require("canvas");

module.exports = {
  name: "edit-embed-image",
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
      name: "imagen",
      description: "Ingrese el enlace de la nueva imagen para el Embed.",
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
      const messageId = interaction.options.get("mensaje").value;
      const newImage = interaction.options.get("imagen").value;

      const channel = client.channels.cache.get(channelId);
      const message = await channel.messages.fetch(messageId);
      const originalEmbed = message.embeds[0];

      const newEmbed = new EmbedBuilder()
        .setTitle(originalEmbed.tlitle)
        .setDescription(originalEmbed.description)
        .setColor(originalEmbed.color)
        .setTimestamp()
        .setImage(newImage);

      if (originalEmbed.thumbnail) {
        newEmbed.setThumbnail(`${originalEmbed.thumbnail}`);
      }

      message.edit({ embeds: [newEmbed] });

      await interaction.deleteReply();
    } catch (error) {
      console.log(`Hubo un error enviando el Embed:\n${error}`);
    }
  },
};

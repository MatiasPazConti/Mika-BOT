const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "edit-embed-description",
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
      name: "descripción",
      description: "Ingrese una nueva descripción para el Embed.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (interaction, client) => {
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
      const rawDescription = interaction.options.get("descripción").value;

      let newDescription = "";
      const nArray = rawDescription.toString().split("/n ");
      for (let n = 0; n < nArray.length; ++n) {
        if (n > 0) {
          newDescription = newDescription + "\n";
        }
        newDescription = newDescription + nArray[n];
      }

      const channel = client.channels.cache.get(channelId);
      const message = await channel.messages.fetch(messageId);
      const originalEmbed = message.embeds[0];

      const newEmbed = new EmbedBuilder()
        .setTitle(originalEmbed.title)
        .setDescription(newDescription)
        .setColor(originalEmbed.color)
        .setTimestamp();

      if (originalEmbed.image) {
        newEmbed.setImage(originalEmbed.image.url);
      }
      if (originalEmbed.thumbnail) {
        newEmbed.setThumbnail(`${originalEmbed.thumbnail.url}`);
      }

      message.edit({ embeds: [newEmbed] });

      await interaction.deleteReply();
    } catch (error) {
      console.log("Hubo un error enviando el Embed:\n", error);
    }
  },
};

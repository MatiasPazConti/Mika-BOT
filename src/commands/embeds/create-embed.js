const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "create-embed",
  description: "Descripción",
  options: [
    {
      name: "canal",
      description: "Ingrese el canal donde se enviará el Embed.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "título",
      description: "Ingrese el título del Embed.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "descripción",
      description: "Ingrese la descripción del Embed.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "color",
      description: "Ingrese el valor HEX del color del Embed.",
      type: ApplicationCommandOptionType.String,
      required: false,
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
      const embedTitle = interaction.options.get("título");
      const embedDescription = interaction.options.get("descripción");
      const embedColor = interaction.options.get("color") || "#F2C4DE";

      const newEmbed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(embedDescription)
        .setColor(`${embedColor}`)
        .setTimestamp();

      client.channels.cache.get(channelId).send({ embeds: [embed] });

      await interaction.deleteReply();
    } catch (error) {
      console.log(`Hubo un error enviando el Embed:\n${error}`);
    }
  },
};

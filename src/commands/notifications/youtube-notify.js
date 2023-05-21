const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YouTubeNotify = require("../../models/YouTubeNotify");

module.exports = {
  name: "notify-youtube-add",
  description: "En desarrollo.",
  options: [
    {
      name: "id",
      description: "ID del canal de YouTube.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Canal donde se notificará la actividad.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    const youtubeId = interaction.options.get("id").value;
    const channelId = interaction.options.get("canal").value;
    return;

    try {
      await interaction.deferReply();

      let youtubeNotify = await YouTubeNotify.findOne({
        guildId: interaction.guild.id,
      });

      if (youtubeNotify) {
        if (youtubeId === youtubeNotify.youtubeChannelId) {
          if (interaction.channel.id === youtubeNotify.discordChannelId) {
            interaction.editReply({
              content:
                "YouTube Notify has already been configured. To disable run '/youtube-notify-disable'.",
              ephemeral: true,
            });
            return;
          } else {
            youtubeNotify.discordChannelId = interaction.channel.id;

            await youtubeNotify.save();
            interaction.editReply({
              content:
                "YouTube Notify now will notify from this channel. To disable run '/youtube-notify-disable'.",
              ephemeral: true,
            });
          }
        }

        youtubeNotify.youtubeChannelId = youtubeId;
        youtubeNotify.discordChannelId = interaction.channel.id;
      } else {
        youtubeNotify = new YouTubeNotify({
          guildId: interaction.guild.id,
          discordChannelId: interaction.channel.id,
          youtubeChannelId: youtubeId,
          lastPostedVideoId: "",
        });
      }

      await youtubeNotify.save();
      interaction.editReply({
        content:
          "YouTube Notify has now been configured. To disable run '/youtube-notify-disable'.",
        ephemeral: true,
      });
      return;
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  },
};

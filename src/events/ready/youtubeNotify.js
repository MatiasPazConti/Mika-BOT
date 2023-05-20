const { google } = require("googleapis");
const YouTubeNotify = require("../../models/YouTubeNotify");

module.exports = async (client, interaction) => {
  setInterval(async () => {
    const guildIds = [];

    client.guilds.cache.every(async (guild) => {
      if (guildIds.lenght > 0 && guild.id === guildIds.first()) {
        return false;
      }
      guildIds.push(guild.id);
      return true;
    });

    for (const guildId of guildIds) {
      let youtubeNotify = await YouTubeNotify.findOne({
        guildId: guildId,
      });

      console.log(youtubeNotify);

      google
        .youtube("v3")
        .search.list({
          key: process.env.YOUTUBE_TOKEN,
          part: "snippet",
          channelId: youtubeNotify.youtubeChannelId,
          maxResults: 1,
          order: "date",
        })
        .then((response) => {
          fetch(response.request.responseURL)
            .then((response) => {
              return response.json();
            })
            .then(async (data) => {
              const lastVideoData = data.items[0];

              if (
                lastVideoData.id.videoId !== youtubeNotify.lastPostedVideoId
              ) {
                client.channels.cache.get(youtubeNotify.discordChannelId).send(
                  `${lastVideoData.snippet.channelTitle} subió un nuevo video!
                \nhttps://www.youtube.com/watch?v=${lastVideoData.id.videoId}`
                );

                youtubeNotify.lastPostedVideoId = lastVideoData.id.videoId;
                await youtubeNotify.save();
                console.log(
                  "Youtube Notify: Notification successfully posted!"
                );
              } else {
                console.log(
                  "Youtube Notify: Notification has been already posted!"
                );
              }
            })
            .catch((error) => {
              console.log(`There was an error:\n${error}`);
            });
        })
        .catch((error) => {
          console.log(`There was an error:\n${error}`);
        });
    }
  }, 1800000); //30 minutos de delay = 1800000*/
};

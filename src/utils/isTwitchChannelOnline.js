require("dotenv").config();
const axios = require("axios");

const getTwitchAccess = async () => {
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
  });
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      body: params,
    });
    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Hubo un error obteniendo el ACCESS_TOKEN:\n", data);
      return data;
    }
  } catch (error) {
    console.error("Hubo un error intentando obtener el ACCESS_TOKEN:\n", error);
  }
};

module.exports = async (channelId) => {
  const API_URL = `https://api.twitch.tv/helix/streams?user_login=${channelId}`;
  try {
    const ACCESS_TOKEN = await getTwitchAccess();
    const response = await axios.get(API_URL, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    const { data } = response.data;
    return data.length !== 0;
  } catch (error) {
    console.error(
      "Twitch-Notifications: Hubo un error intentando acceder a la información del canal\n",
      error
    );
  }
};

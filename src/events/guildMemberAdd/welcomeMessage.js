const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const getWelcomeCanvas = require("../../utils/getWelcomeCanvas");
const Welcome = require("../../models/Welcome");

module.exports = async (client, member) => {
  let welcome = await Welcome.findOne({
    guildId: member.guild.id,
  });

  if (!welcome) {
    console.log("No se ha registrado un canal de auto-mensajes de bienvenida.");
    return;
  }

  let welcomeMsg = `¡Bienvenido/a ${member}, soy <@1108378229439483945>!`;
  if (welcome.welcomeMessage) {
    welcomeMsg = `${welcomeMsg}\n${welcome.welcomeMessage}`;
  } else {
    welcomeMsg =
      `${welcomeMsg}\n` +
      "Por favor, asegúrate de haber leído correctamente todas nuestras normas, y por cualquier consulta no dudes en comunicarte con nuestro staff.";
  }

  let canvas = await getWelcomeCanvas(member);

  await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: "png", size: 1024 })
  ).then(async (img) => {
    context.drawImage(img, 393, 47, 238, 238);
  });

  let attachment = new AttachmentBuilder(canvas.create.toBuffer(), {
    name: `welcome-${member.id}.png`,
  });

  const userTag = member.user.tag.split("#");
  let embed = new EmbedBuilder()
    .setTitle(`¡Bienvenido/a ${userTag[0]}!`)
    .setDescription(welcomeMsg)
    .setColor("#F2C4DE")
    .setImage(`attachment://welcome-${member.id}.png`);

  try {
    client.channels.cache.get(welcome.discordChannelId).send({
      embeds: [embed],
      files: [attachment],
    });
  } catch (error) {
    console.log(`Hubo un error enviando el canvas:\n${error}`);
  }
};

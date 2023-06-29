const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const Canvas = require("canvas");
const ServerBoost = require("../../models/ServerBoost");

const assets = `${__dirname}/../../assets`;

Canvas.registerFont(`${assets}/font/Arialn.ttf`, {
  family: "Arial Narrow",
});

const createBasicCanvas = async () => {
  let newCanvas = {};
  newCanvas.create = Canvas.createCanvas(1024, 500);

  let context = (newCanvas.context = newCanvas.create.getContext("2d"));
  context.font = "72px Arial Narrow";
  context.textAlign = "center";
  context.strokeStyle = "#323277";
  context.fillStyle = "#ffffff";

  await Canvas.loadImage(`${assets}/img/mikaWelcome.png`).then(async (img) => {
    context.drawImage(img, 0, -38, 1024, 576);
    context.strokeText("¡GRACIAS!", 512, 360);
    context.fillText("¡GRACIAS!", 512, 360);
    context.beginPath();
    context.arc(512, 166, 128, 0, Math.PI * 2, true);
    context.stroke();
    context.fill();
  });

  return newCanvas;
};

const createThanksCanvas = async (member) => {
  const userTag = member.user.tag.split("#");
  let canvasTag = userTag[0];
  if (userTag[1] != "0") {
    canvasTag = member.user.tag;
  }

  let thanksCanvas = await createBasicCanvas();
  let context = thanksCanvas.context;
  context.font = "42px Arial Narrow";
  context.strokeText(canvasTag, 512, 410);
  context.fillText(canvasTag, 512, 410);
  context.beginPath();
  context.arc(512, 166, 119, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();

  await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: "png", size: 1024 })
  ).then(async (img) => {
    context.drawImage(img, 393, 47, 238, 238);
  });

  return thanksCanvas;
};

module.exports = async (client, member) => {
  const oldMember = member.oldMember;
  const newMember = member.newMember;
  let serverBoost = await ServerBoost.findOne({
    guildId: newMember.guild.id,
  });

  if (!serverBoost) {
    console.log(
      "No se ha registrado un canal de auto-mensajes de mejoras de servidor."
    );
    return;
  }

  const oldBoostingStatus = oldMember.premiumSince;
  const newBoostingStatus = newMember.premiumSince;

  if (!oldBoostingStatus && newBoostingStatus) {
    let thanksMsg = `¡Gracias por mejorar nuestro servidor!`;
    if (serverBoost.thanksMessage) {
      thanksMsg = `${serverBoost.thanksMessage}`;
    }

    let canvas = await createThanksCanvas(newMember);

    let attachment = new AttachmentBuilder(canvas.create.toBuffer(), {
      name: `serverBoost-${newMember.id}.png`,
    });

    const userTag = newMember.user.tag.split("#");
    let embed = new EmbedBuilder()
      .setTitle(`¡Gracias ${userTag[0]}!`)
      .setDescription(thanksMsg)
      .setColor("#F2C4DE")
      .setImage(`attachment://serverBoost-${newMember.id}.png`);

    try {
      client.channels.cache.get(serverBoost.discordChannelId).send({
        content: `${member}`,
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      console.log(`Hubo un error enviando el canvas:\n${error}`);
    }
  }
};

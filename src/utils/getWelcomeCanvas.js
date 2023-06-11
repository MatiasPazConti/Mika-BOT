const Canvas = require("canvas");

const assets = `${__dirname}/../assets`;

Canvas.registerFont(`${assets}/font/Arialn.ttf`, {
  family: "Arial Narrow",
});

const createCanvas = async () => {
  let newCanvas = {};
  newCanvas.create = Canvas.createCanvas(1024, 500);

  let context = (newCanvas.context = newCanvas.create.getContext("2d"));
  context.font = "72px Arial Narrow";
  context.textAlign = "center";
  context.strokeStyle = "#323277";
  context.fillStyle = "#ffffff";

  await Canvas.loadImage(`${assets}/img/mikaWelcome.png`).then(async (img) => {
    context.drawImage(img, 0, -38, 1024, 576);
    context.strokeText("¡BIENVENIDO!", 512, 360);
    context.fillText("¡BIENVENIDO!", 512, 360);
    context.beginPath();
    context.arc(512, 166, 128, 0, Math.PI * 2, true);
    context.stroke();
    context.fill();
  });

  return newCanvas;
};

module.exports = async (member) => {
  let welcomeCanvas = await createCanvas();
  let context = welcomeCanvas.context;
  context.font = "42px Arial Narrow";
  context.strokeText(member.user.tag, 512, 410);
  context.fillText(member.user.tag, 512, 410);
  context.beginPath();
  context.arc(512, 166, 119, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();

  await Canvas.loadImage(
    member.user.displayAvatarURL({ extension: "png", size: 1024 })
  ).then(async (img) => {
    context.drawImage(img, 393, 47, 238, 238);
  });

  return welcomeCanvas;
};

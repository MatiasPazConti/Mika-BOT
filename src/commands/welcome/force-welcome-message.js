const {
  AttachmentBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const getWelcomeCanvas = require("../../utils/getWelcomeCanvas");
const Welcome = require("../../models/Welcome");

module.exports = {
  name: "force-welcome-message",
  description: "Raliza un mensaje de bienvenida al usuario seleccionado.",
  options: [
    {
      name: "usuario",
      description: "Usuario destinatario.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    interaction.deferReply();
    interaction.deleteReply();

    const member = interaction.options.get("usuario").member;

    let welcome = await Welcome.findOne({
      guildId: member.guild.id,
    });

    if (!welcome) {
      console.log(
        "No se ha registrado un canal de auto-mensajes de bienvenida."
      );
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
  },
};

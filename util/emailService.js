const { welcomeHTML } = require("./emailTemplates");
const { Client } = require("ensend");

const ensend = new Client({
  secret: process.env.SMTP_PROJECT_SECRET,
});

async function sendMail(subject, message, email) {
  try {
    const res = await ensend.SendApi.SendMailMessage({
      subject: subject,
      message: message,
      sender: {
        name: "SHIFT",
        address: "shft-team@ensend.me",
      },
      recipients: [
        {
          name: "",
          address: email,
        },
      ],
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

async function sendMailTemplate(subject, templateId, varaibles, email) {
  try {
    const res = await ensend.SendApi.SendMailMessage({
      subject: subject,
      template: {
        id: templateId,
        variables: {
          ...varaibles,
        },
      },
      sender: {
        name: "SHIFT",
        address: "shft-team@ensend.me",
      },
      recipients: [
        {
          name: "",
          address: email,
        },
      ],
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

// sendMail(
//   `Welcome to SHFT – You’ve Been Added by dudeyouhavenoieda!`,
//   welcomeHTML("dudeyouhavenoidea", "2345SHFT"),
//   // "testing email",
//   "bamiayo90@gmail.com",
// );

// sendMailTemplate(`Welcome to SHFT – You’ve Been Added by dudeyouhavenoieda!`, )

module.exports = sendMail;

const { createClient } = require("smtpexpress");
const { welcomeHTML } = require("./emailTemplates");

const smtpexpressClient = createClient({
  projectId: process.env.SMTP_PROJECT_ID || "sm0pid-SJSSvo1jBTJ4yD9VcHvyutY7b",
  projectSecret:
    process.env.SMTP_PROJECT_SECRET ||
    "a53e3adfd134309135af5baadb30cad3e1b53f85e57367f8fd",
});

async function sendMail(subject, message, email) {
  try {
    const res = await smtpexpressClient.sendApi.sendMail({
      subject: subject,
      message: message,
      sender: {
        name: "Ayo Ike",
        email: "shft-de5f91@smtpexpress.email",
      },
      recipients: email,
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

async function sendMailTemplate(subject, templateId, varaibles, email) {
  try {
    const res = await smtpexpressClient.sendApi.sendMail({
      subject: subject,
      template: {
        id: templateId,
        variables: {
          ...varaibles,
        },
      },
      sender: {
        name: "Ayo Ike",
        email: "shft-de5f91@smtpexpress.email",
      },
      recipients: email,
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
//   "bamiayo90@gmail.com"
// );

// sendMailTemplate(`Welcome to SHFT – You’ve Been Added by dudeyouhavenoieda!`, )

module.exports = sendMail;

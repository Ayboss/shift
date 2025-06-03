const { createClient } = require("smtpexpress");

const smtpexpressClient = createClient({
  projectId: process.env.SMTP_PROJECT_ID,
  projectSecret: process.env.SMTP_PROJECT_SECRET,
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

module.exports = sendMail;

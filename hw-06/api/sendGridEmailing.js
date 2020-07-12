const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailToVerified(email, verificationToken) {
  const msg = {
    to: email,
    from: 'ig2108@yahoo.com',
    subject: 'Confirm e-mail',
    text: 'Please, confirm your e-mail',
    html: `<a href='http://localhost:${process.env.PORT}/auth/verify/${verificationToken}'>Click to verify your email</a>`,
  };
  const result = await sgMail.send(msg);
  console.log(msg.html);
}

module.exports = { sendEmailToVerified };

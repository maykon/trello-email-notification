const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: [],
  from: process.env.MAIL_FROM,
  subject: process.env.MAIL_SUBJECT,
  text: "",
  html: ""
};

module.exports = {
  msg,
  sgMail
};

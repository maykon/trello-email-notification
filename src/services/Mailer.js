const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: [],
  from: "Versões SG5 <no-replay@versoes-sg5.com.br>",
  subject: "Próximas Versões SG5 agendadas",
  text: "",
  html: ""
};

module.exports = {
  msg,
  sgMail
};

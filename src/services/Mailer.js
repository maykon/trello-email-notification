const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  /*to: [
    "Augusto Feliciano Dias Brum de Sousa <augusto.sousa@softplan.com.br>",
    "Ana Barão <ana.barao@softplan.com.br>",
    "Beatriz Mayumi Avelar Makiyama <beatriz.makiyama@db1.com.br>",
    "Jeferson Davi Parckert <jeferson.parckert@db1.com.br>",
    "Jocimar Borges Abrantes Huss <jocimar.huss@db1.com.br>",
    "Jovani Pereira da Rocha <jovani.rocha@softplan.com.br>",
    "Italo Andrade de Souza <italo.souza@db1.com.br>",
    "Luis Felipe Olivetti <luis.olivetti@db1.com.br>",
    "Maycon Renan Ribeiro dos Santos <maycon.santos@db1.com.br>",
    "Maykon Luís Capellari <maykon.capellari@db1.com.br>",
    "Murilo Henrique de Castro <murilo.castro@db1.com.br>",
    "Pio Neto <pio.neto@db1.com.br>",
    "Sandra Laranjeira <sandra.laranjeira@softplan.com.br>",
    "Tiago Daniel Boschetti <tiago.boschetti@db1.com.br>",
    "Wesley Rodrigues Machado <wesley.machado@db1.com.br>"
  ],*/

  from: "Versões SG5 <no-replay@versoes-sg5.com.br>",
  subject: "Próximas Versões SG5 agendadas",
  text: "",
  html: ""
};

module.exports = {
  msg,
  sgMail
};

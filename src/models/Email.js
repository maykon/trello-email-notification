const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

const EmailSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EmailSchema.virtual("fullEmail").get(function() {
  return `${this.name} <${this.email}>`;
});

EmailSchema.statics.getEmailList = async function() {
  const emailList = await this.find({});
  if (!emailList.length) return [];

  let emails = [];
  emailList.forEach(email => {
    emails.push(email.fullEmail);
  });
  return emails;
};

EmailSchema.plugin(timeZone);
module.exports = mongoose.model("emails", EmailSchema);

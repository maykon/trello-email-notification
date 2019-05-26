const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

const EmailSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  showEmail: {
    type: Boolean,
    default: true
  },
  showNotification: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EmailSchema.virtual("fullEmail").get(function() {
  return `${this.name} <${this.email}>`;
});

EmailSchema.statics.updateOptions = async function(options) {
  var email = await this.findOneAndUpdate({ email: options.email }, options, {
    upsert: true
  });
  return email;
};

EmailSchema.statics.getEmailList = async function() {
  let emailList = await this.find({});
  if (!emailList.length) return [];
  let active_mails = emailList.filter(email => email.showEmail);
  let emails = [];
  active_mails.forEach(email => {
    emails.push(email.fullEmail);
  });
  return emails;
};

EmailSchema.plugin(timeZone);
module.exports = mongoose.model("emails", EmailSchema);

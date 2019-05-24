const mongoose = require("mongoose");
const { getTodayNightDate } = require("../services/Utils");

const VersionSchema = new mongoose.Schema({
  trello_id: String,
  name: String,
  dateLastActivity: {
    type: Date
  },
  idList: String,
  url: String,
  due: {
    type: Date
  },
  lastDue: {
    type: Date
  },
  dueComplete: Boolean,
  finished: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

VersionSchema.statics.createVersion = async function(data) {
  const {
    id: trello_id,
    name,
    dateLastActivity,
    idList,
    url,
    due,
    dueComplete,
    finished,
    createdAt
  } = data;
  return await this.create({
    trello_id,
    name,
    dateLastActivity,
    idList,
    url,
    due,
    dueComplete,
    finished,
    createdAt,
    finished: false
  });
};

VersionSchema.statics.markVersionSendMail = async function(data) {
  const ids = data.map(version => version.id);
  if (!ids.length) return;
  const search = { _id: { $in: ids } };
  const updateData = {
    $set: {
      finished: true,
      lastDue: null
    }
  };
  await this.updateMany(search, updateData);
};

VersionSchema.statics.getNextVersions = async function() {
  const search = { finished: false };
  return await this.find(search);
};

VersionSchema.methods.updateVersion = async function(data) {
  for (key in data) {
    if (key === "id") continue;
    if (key === "lastDue") continue;
    if (key === "createdAt") continue;
    if (key === "due") {
      if (this.due === null && data.due !== null) {
        this.lastDue = null;
        this.finished = false;
      } else if (this.due !== null && data.due === null) {
        this.lastDue = this.due;
        this.finished = false;
      } else if (this.due !== null && data.due !== null) {
        if (new Date(this.due).getTime() !== new Date(data.due).getTime()) {
          this.lastDue = this.due;
          this.finished = false;
        }
      }

      if (data.due !== null) {
        let today = getTodayNightDate().getTime();
        let due = new Date(data.due).getTime();
        if (due < today) this.finished = true;
      }
    }

    if (this[key] !== data[key]) this[key] = data[key];
  }
  return await this.save();
};

module.exports = mongoose.model("versions", VersionSchema);

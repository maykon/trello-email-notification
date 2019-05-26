const Version = require("../models/Version");
const Email = require("../models/Email");

const api = require("./TrelloApi");
const { sgMail: Mailer, msg } = require("./Mailer");
const {
  getTodayDate,
  getNextVersionDate,
  formatTextEmail,
  formatHTMLEmail,
  getVersionsCorrectDate,
  getUpdateNotification
} = require("./Utils");

function GetTrelloToken() {
  return `key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;
}

const getTrelloVersions = async (search = "") => {
  const response = await api.get(
    `/${process.env.TRELLO_BOARD_ID}/?${search}&${GetTrelloToken()}`
  );
  return response;
};

const filterScheduledVersion = version => {
  let versionDue = version.due ? new Date(version.due).getTime() : null;
  let versionLastDue = version.lastDue
    ? new Date(version.lastDue).getTime()
    : null;
  let today = getTodayDate().getTime();
  let nextDate = getNextVersionDate().getTime();
  return (
    (version.due === null && versionLastDue !== null) ||
    (version.due !== null && (versionDue >= today && versionDue <= nextDate))
  );
};

const getScheduledVersion = data => {
  const active_versions = data.filter(version =>
    filterScheduledVersion(version)
  );
  return active_versions;
};

const getVersions = data => {
  const active_versions = data.cards.filter(
    version => version.idList !== process.env.TRELLO_LIST_IGNORE
  );
  return getVersionsCorrectDate(active_versions);
};

const updateVersionsDB = async data => {
  await data.forEachAsyncParallel(async item => {
    const version = await Version.findOne({ trello_id: item.id });
    if (!version) {
      await Version.createVersion(item);
    } else {
      await version.updateVersion(item);
    }
  });
};

const getProcessedVersion = async () => {
  let versions = await Version.getNextVersions();
  if (!versions.length) return [];
  versions = getScheduledVersion(versions);
  if (!versions.length) return [];
  return versions;
};

const sendEmailVersions = async versions => {
  if (!versions.length) return [];
  const emails = await Email.getEmailList();
  if (!emails.length) return [];
  msg.to = emails;
  msg.text = formatTextEmail(versions);
  msg.html = formatHTMLEmail(versions);
  Mailer.sendMultiple(msg);
  //await Version.markVersionSendMail(versions);
  return versions;
};

const sendNotification = (io, versions) => {
  if (!versions.length) return;
  let notification = getUpdateNotification(versions);
  io.emit("versions", notification);
};

const updadateNewVersions = async () => {
  const response = await getTrelloVersions(
    "fields=name,url&cards=visible&card_fields=name,url,due,dueComplete,dateLastActivity,idList"
  );
  const actives = getVersions(response.data);
  await updateVersionsDB(actives);
};

const processUpdateVersions = async io => {
  await updadateNewVersions();
  let versions = await getProcessedVersion();
  sendNotification(io, versions);
  return await sendEmailVersions(versions);
};

const sendResetChrome = (io, versions) => {
  if (!versions.length) return;
  let notification = getUpdateNotification(versions);
  io.emit("reset", notification);
};

const resetVersions = async io => {
  await Version.deleteMany({});
  await updadateNewVersions();
  let versions = await getProcessedVersion();
  sendResetChrome(io, versions);
};

module.exports = {
  getScheduledVersion,
  getProcessedVersion,
  getTrelloVersions,
  getVersions,
  processUpdateVersions,
  resetVersions
};

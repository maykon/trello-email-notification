const dateFormat = require("dateformat");

const lastHour = "$123:59:59.000Z";
const initialHour = "$100:00:00.000Z";
const tzBrasilia = 3;

const getTimeZoneDate = (date = null) => {
  if (date === null) return null;
  const tzDate = new Date(date);
  tzDate.setHours(tzDate.getHours() - tzBrasilia);
  return tzDate;
};

const isRescheduled = version => {
  return (
    version.lastDue &&
    version.due !== null &&
    new Date(version.due).getTime() !== new Date(version.lastDue).getTime()
  );
};

const formatVersionTextUpdated = version => {
  let reScheduled = isRescheduled(version);
  let textRescheduled = reScheduled ? "Reagendada: " : "";
  let aborted = version.lastDue && version.due === null;
  let textAborted = aborted ? "Removido da versão - " : "";
  let textDateRescheduled =
    reScheduled || textAborted
      ? ` (Data anterior: ${dateFormat(
          new Date(version.lastDue),
          "dd/mm - HH:MM:ss",
          true
        )})`
      : "";
  return `${textRescheduled}${textAborted}${formatVersionText(
    version
  )}${textDateRescheduled}`;
};

const formatVersionText = version => {
  const dataStr = version.due
    ? ` - Data: ${dateFormat(new Date(version.due), "dd/mm - HH:MM:ss", true)}`
    : "";
  return `${version.name}${dataStr}`;
};

const getDateFormated = (date, hourReplaced) => {
  let dateStr = date.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T).*/g, hourReplaced);
  return new Date(dateStr);
};

const getTodayDate = () => {
  const dateStr = new Date().toISOString();
  let todayDate = getDateFormated(dateStr, initialHour);
  return new Date(todayDate);
};

const getTodayNightDate = () => {
  const dateStr = new Date().toISOString();
  let todayDate = getDateFormated(dateStr, lastHour);
  return new Date(todayDate);
};

const getNextVersionDate = () => {
  const today = new Date();
  let nextDay = 1;
  switch (today.getDay()) {
    case 5:
      nextDay = 3;
      break;
    case 6:
      nextDay = 2;
      break;
    default:
      nextDay = 1;
  }
  today.setDate(today.getDate() + nextDay);
  const dateStr = today.toISOString();
  let nextDate = getDateFormated(dateStr, lastHour);
  return new Date(nextDate);
};

const formatTextEmail = data => {
  let text = "As seguintes versões estão agendadas para liberação: \n\n";
  data.forEach(version => {
    text += `* ${formatVersionTextUpdated(version)}\n`;
  });
  return text;
};

const formatHTMLEmail = data => {
  let text = "<h1>As seguintes versões estão agendadas para liberação:</h1>";
  text += `<ul id="versions">`;
  data.forEach(version => {
    const id = version.id ? version.id : version.trello_id;
    text += `<li id="${version.id}">${formatVersionTextUpdated(version)}</li>`;
  });
  text += "</ul>";
  return text;
};

const getUpdateNotification = versions => {
  let notification = [];
  versions.forEach(version => {
    const id = version.trello_id;
    const text = formatVersionTextUpdated(version);
    const { name, due } = version;
    notification.push({ id, text, name, due });
  });
  return notification;
};

const getVersionsCorrectDate = versions => {
  return versions.map(version => ({
    ...version,
    trello_id: version.trello_id ? version.trello_id : version.id,
    due: getTimeZoneDate(version.due),
    lastDue: getTimeZoneDate(version.lastDue),
    dateLastActivity: getTimeZoneDate(version.dateLastActivity),
    createdAt: getTimeZoneDate(version.createdAt)
  }));
};

Array.prototype.forEachAsync = async function(fn) {
  for (let t of this) {
    await fn(t);
  }
};

Array.prototype.forEachAsyncParallel = async function(fn) {
  await Promise.all(this.map(fn));
};

module.exports = {
  getTimeZoneDate,
  getTodayDate,
  getTodayNightDate,
  getNextVersionDate,
  formatTextEmail,
  formatHTMLEmail,
  getVersionsCorrectDate,
  getUpdateNotification
};

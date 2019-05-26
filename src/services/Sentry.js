const cron = require("node-cron");
const versions = require("./versions");

const sentry = io => {
  let socketIo = io;
  versions.processUpdateVersions(socketIo);

  cron.schedule("*/30 * * * *", () => {
    try {
      versions.processUpdateVersions(socketIo);
    } catch (err) {
      return console.error(err);
    }
  });

  cron.schedule("1 0 * * *", () => {
    try {
      versions.resetVersions(socketIo);
    } catch (err) {
      return console.error(err);
    }
  });
};

module.exports = sentry;

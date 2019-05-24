const cron = require("node-cron");
const versions = require("./versions");

versions.processUpdateVersions();

module.exports = cron.schedule("*/30 * * * *", () => {
  try {
    versions.processUpdateVersions();
  } catch (err) {
    return console.error(err);
  }
});

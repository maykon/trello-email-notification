const routes = require("express").Router();
const versions = require("./services/versions");
const Email = require("./models/Email");
const Version = require("./models/Version");
const {
  getVersionsCorrectDate,
  getUpdateNotification
} = require("./services/Utils");

routes.get("/full_versions", async (req, res) => {
  const response = await versions.getTrelloVersions(
    "fields=name,url&cards=visible"
  );
  return res.json(getVersionsCorrectDate(response.data.cards));
});

routes.get("/versions", async (req, res) => {
  try {
    const response = await versions.getTrelloVersions(
      "fields=name,url&cards=visible&card_fields=name,url,due,dueComplete,dateLastActivity,idList"
    );
    const actives = versions.getVersions(response.data);
    const scheduled = versions.getScheduledVersion(actives);
    let notification = getUpdateNotification(scheduled);
    return res.json(notification);
  } catch (err) {
    return res.status(500).json({ error: JSON.stringify(err) });
  }
});

routes.post("/versions", async (req, res) => {
  try {
    const updated = await versions.processUpdateVersions(req.io);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

routes.delete("/versions", async (req, res) => {
  await await versions.resetVersions(req.io);
  res.send();
});

routes.post("/emails/options", async (req, res) => {
  if (!req.body.email)
    return res.status(404).json({ error: "Has not a email" });

  await Email.updateOptions(req.body);
  res.send();
});

routes.post("/emails", async (req, res) => {
  if (!req.body.emails)
    return res.status(404).json({ error: "Has not a email" });

  try {
    const emails = await Email.insertMany(req.body.emails);
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Error in insert emails." });
  }
});

module.exports = routes;

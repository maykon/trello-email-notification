const axios = require("axios");

const api = axios.create({
  baseURL: process.env.TRELLO_API_URL
});

module.exports = api;

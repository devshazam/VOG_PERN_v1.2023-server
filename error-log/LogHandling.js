const fs = require("fs");
const path = require("path");

const appendFiles = async (data) => {
  try {
    console.log(__dirname, 'errore-log/LogHandling.js')
    let utc = new Date()
    data = data + `; ${utc}`
    await fs.promises.appendFile(`${__dirname}/log.txt`, data);
  } catch (error) {
    console.error(error);
  }
};


module.exports = { appendFiles };
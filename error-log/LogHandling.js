const fs = require("fs");


const appendFiles = async (path, data) => {
  try {
    await fs.promises.appendFile(path, data);

  } catch (error) {
    console.error(error);
  }
};


module.exports = { appendFiles };
const { config } = require("../../../config");

exports.confirmationTemplate = async (name) => {
  return `<b>Hello world! ${name}</b>`;
};



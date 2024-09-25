const { config } = require("../../../config");

exports.confirmationTemplate = async (name, totalPrice, seats) => {
  return `<b>Hello world! ${name} . Price :${totalPrice}  . seats : ${seats.join(',')}</b>`;
};



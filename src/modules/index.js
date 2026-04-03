const request = require("./request");
const chat = require("./chat");

module.exports = {
  resourceDB: require("./resource"),
  userDB: require("./user"),
  feedbackDB: require("./feedback"),
  bookingDB: require("./booking"),
  requestDB: require("./request"),
  demandDB: require("./demand"),
  paymentDB: require("./payment"),
  chatDB: chat,
  Analytics: require("./analytics"),
};

global.log = require("rise-common-electron").logger();
const webhook = require("./webhook.js");
webhook.listen();

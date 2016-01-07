const webhook = require("./webhook.js");

global.log = require("rise-common-electron").logger();
webhook.listen();

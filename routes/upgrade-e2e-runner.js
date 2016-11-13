const crypto = require("crypto"),
inflate = require("inflation"),
raw = require("raw-body"),
updateUtils = require("../utils/control-e2e-runner.js"),
// replace this with a file containing secret
localSecret = "secret";

function sign(string, key) {
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(string);
  return hmac.digest("hex");
}

module.exports = function*(next) {
  const signature = this.request.header["X-Hub-Signature"];
  const body = yield raw(inflate(this.req), "utf-8");

  // Check for invalid signature
  if (signature != sign(body, localSecret)) {
    this.response.body = "Invalid signature";
    this.response.status = 403;
  } else {
    this.response.body = "Ok";
    if (this.request.body.ref === "refs/heads/master") {
      console.log("restarting");
      //restart();
    }
  }
};

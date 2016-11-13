const crypto = require("crypto"),
restart = require("../utils/control-e2e-runner.js").restart,
// replace this with a file containing secret
localSecret = "secret";

function sign(string, key) {
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(string);
  return hmac.digest("hex");
}

module.exports = function*(next) {
  const signature = this.request.header["x-hub-signature"];
  const rawBody = this.request.rawBody;
  const body = this.request.jsonBody;
  // If body is not a json, return 400
  if (!body) {
    this.response.status = 400;
    this.response.body = "Couldn't parse body";
  } else {
    if (signature != sign(rawBody, localSecret)) {
      this.response.body = "Invalid signature";
      this.response.status = 403;
    } else {
      this.response.body = "Ok";
      if (body.ref === "refs/heads/master") {
        restart();
      }
    }
  }
  yield next;
};

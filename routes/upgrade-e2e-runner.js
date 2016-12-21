const crypto = require("crypto"),
acceptableHashes = ["sha1"],
path = require("path"),
platform = require("rise-common-electron").platform,
restart = require("../utils/control-e2e-runner.js").restart,
localSecret = platform.readTextFileSync(path.join(__dirname,
                                                  "..",
                                                  "secret.txt"));

function sign(hash, string, key) {
  const hmac = crypto.createHmac(hash, key);
  hmac.update(string);
  return hmac.digest("hex");
}

module.exports = function*(next) {
  const rawBody = this.request.rawBody;
  const body = this.request.jsonBody;
  let  hash, signature;

  try {
    [hash, signature] = this.request.header["x-hub-signature"].split("=");
  } catch (e) {}

  if (!body || !signature || !hash || (acceptableHashes.indexOf(hash) < 0)) {
    this.response.status = 400;
    this.response.body = "Invalid request";
  } else if (signature != sign(hash, rawBody, localSecret)) {
    this.response.body = "Invalid signature";
    this.response.status = 403;
  } else {
    this.response.body = "Ok";
    this.response.status = 200;
    if (body.ref === "refs/heads/master") {
      restart();
    }
  }

  yield next;
};

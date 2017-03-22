const path = require("path"),
      inspect = require("util").inspect,
      fs = require("fs"),
      request = require("request"),
      messaging = require("./utils/messaging.js"),
      displayId = fs.readFileSync(path.join(__dirname, "displayid.txt"), { encoding: "utf8" }).trim().split("=")[1];

module.exports = {
  checkScreenshotSaved() {
    var signedUrl = process.env.E2E_SCREENSHOT_SIGNED_URL;

    log.debug("checking that the screenshot request is processed");

    if(!signedUrl || signedUrl.indexOf("GoogleAccessId") === -1) {
      throw new Error("E2E_SCREENSHOT_SIGNED_URL environment variable is not a valid signed url");
    }

    return new Promise((res, rej)=>{
      var validateUrl = signedUrl.substr(0, signedUrl.indexOf("?"));
      var fakeClient = messaging.createClient();
      var lastModified = "";

      fakeClient.connect((data)=>{
        log.debug("message from Messaging Service to mock displays app\n" + inspect(data, {depth: 4}));
        if (data.msg === "screenshot-saved" &&
            data.displayId === displayId && data.clientId === fakeClient.getClientId()) {
          request.head({ url: validateUrl }, (err, resp, body)=>{
            if(err || resp.statusCode !== 200) {
              log.debug("screenshot not found", body);
              rej(err || resp.statusCode);
            }
            else if(lastModified === resp.headers["last-modified"]) {
              log.debug("screenshot not modified - got " + lastModified);
              rej("screenshot not modified");
            }
            else {
              log.debug("screenshot saved");
              res();
            }
          });
        }
        else if(data.msg === "screenshot-failed") {
          log.debug("screenshot failed");
          rej();
        }
      })
      .then(()=>{
        return new Promise((res)=>{
          log.debug("sending request for lastModified");
          log.debug(validateUrl);
          request.head({ url: validateUrl }, (err, resp)=>{
            if(resp.statusCode === 200) {
              lastModified = resp.headers["last-modified"];
            }

            log.debug("resolving request for lastModified - got " + lastModified);
            res();
          });
        });
      })
      .then(()=>{
        var screenshotParams = "&did=" + displayId + "&cid=" + fakeClient.getClientId() + "&url=" + encodeURIComponent(signedUrl),
            screenshotUrl = messaging.serverUrl + screenshotParams + "&msg=screenshot";

        log.debug("sending screenshot updated to messaging service");
        log.debug(screenshotUrl);

        request(screenshotUrl, (err, resp, body)=>{
          if(err || resp.statusCode !== 200) {
            log.debug("Screenshot request error", err || resp.statusCode, body);
            rej(err || resp.statusCode);
          } else {
            log.debug("Screenshot request sent - fakeClient should receive it");
          }
        });
      });
    });
  }
};

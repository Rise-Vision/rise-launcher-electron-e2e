const path = require("path"),
      fs = require("fs"),
      request = require("request"),
      messaging = require("./utils/messaging.js"),
      displayId = fs.readFileSync(path.join(__dirname, "displayid.txt"), { encoding: "utf8" }).trim().split("=")[1];

module.exports = {
  checkScreenshotSaved() {
    var signedUrl = "https://storage.googleapis.com/risevision-display-screenshots/screenshot-request-e2e.jpg?GoogleAccessId=messaging-service-client@display-messaging-service.iam.gserviceaccount.com&Expires=2336138090&Signature=Q30bxAqA9RSg6Xnltqy5XuDSm1LLydTjLa0nfm845JO05ETTFUi9s54j%2ForX51ywrFP0NXoqWJuxUx50%2BYNXPwTSpV616GVpjyIo3bbVEwfw%2BnYEbOWMslI354WaiUWLtHdNnJhVS%2Fyura67CQzF%2B1o2Qnj6UtnxEEdz37SvwigZKvwLhu5EwwAB19fYu7X1Ci%2BEY%2Brd5sOBbsE5WWXuDVC%2FycAQLbtf2piz2PamVY%2FZAueh7pNC%2BjfXwsPk51EJbiUqS0ShP4EBVMslttflwQ5T3%2F2GWZEk6hoZz37NDVm%2FuWE28uwW93QRqgftIhcm3QLmW%2FfklXVi7nu9U388Ag%3D%3D";
    var validateUrl = "http://storage.googleapis.com/risevision-display-screenshots/screenshot-request-e2e.jpg";

    log.debug("checking that the screenshot request is processed");

    return new Promise((res, rej)=>{
      var fakeClient = messaging.createClient();
      var dateNow = new Date().toUTCString();

      fakeClient.connect((data)=>{
        if (data.msg === "screenshot-saved" &&
            data.displayId === displayId && data.clientId === fakeClient.getClientId()) {
          request.head({ url: validateUrl, headers: { "If-Modified-Since": dateNow } }, (err, resp, body)=>{
            if(err || resp.statusCode !== 200) {
              log.debug("screenshot not found", body);
              rej(err || resp.statusCode);
            }
            else if(resp.statusCode === 304) {
              log.debug("Image not uploaded by this process");
              rej(resp.statusCode);
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
        var screenshotParams = "&did=" + displayId + "&cid=" + fakeClient.getClientId() + "&url=" + encodeURIComponent(signedUrl),
            screenshotUrl = messaging.serverUrl + screenshotParams + "&msg=screenshot";

        request(screenshotUrl, (err, resp, body)=>{
          if(err || resp.statusCode !== 200) {
            console.log("Screenshot request error", err || resp.statusCode, body);
            rej(err || resp.statusCode);
          }
        });
      });
    });
  }
};

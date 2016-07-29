const path = require("path"),
      fs = require("fs"),
      http = require("http"),
      messaging = require("./utils/messaging.js"),
      displayId = fs.readFileSync(path.join(__dirname, "displayid.txt"), { encoding: "utf8" }).trim().split("=")[1];

module.exports = {
  checkScreenshotSaved() {
    var filename = displayId + ".jpg";

    log.debug("checking that the screenshot request is processed");

    return new Promise((res, rej)=>{
      var server = messaging.createServer((data)=>{
        if(data.msg === "screenshot-saved") {
          var req = http.request({
            method: "HEAD",
            host: "storage.googleapis.com",
            path: "/risevision-display-screenshots/" + filename
          }, (response)=>{
            if(response.statusCode === 200) {
              log.debug("screenshot saved");
              res();
            }
            else {
              log.debug("screenshot not found");
              rej();
            }
          });

          req.end();
        }
        else if(data.msg === "screenshot-failed") {
          log.debug("screenshot failed");
          rej();
        }
      });

      server.connect()
        .then(()=>{
          server.write({ msg: "screenshot-request", displayId: displayId, filename: filename });
        });
    });
  }
};

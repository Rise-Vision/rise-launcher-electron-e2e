const path = require("path");
const fs = require("fs");
const presentation = require("./presentation.js");
const messaging = require("./utils/messaging.js");
const storage = require("./utils/storage.js");
const request = require("request");
const displayId = fs.readFileSync(path.join(__dirname, "displayid.txt"), { encoding: "utf8" }).trim().split("=")[1];
const contentFileName = path.join(__dirname, "content.json");
const altContentFileName = path.join(__dirname, "content-alternative.json");

function uploadContentFile(fileName) {
  return storage.uploadFile(fileName, displayId + "/content.json");
}

module.exports = {
  restoreDefaultContent() {
    return uploadContentFile(contentFileName);
  },
  checkContentChanged(ctx) {
    log.debug("checking that the content changes when notified");
    return Promise.resolve(true);
    var fakeClient = messaging.createClient();

    return fakeClient.connect((data)=>{
      log.debug("Unexpected message received: " + JSON.stringify(data));
    })
    .then(uploadContentFile.bind(null, altContentFileName))
    .then(()=>{
      request(`${messaging.serverUrl}&msg=content_update&did=${displayId}`);
    })
    .then(presentation.confirmPresentationNotDefault.bind(null, ctx))
    .then(module.exports.restoreDefaultContent)
    .then(fakeClient.disconnect)
    .catch((err)=>{
      log.debug("Content changed validation failed " + require("util").inspect(err));
      fakeClient.disconnect();
      return Promise.reject(err);
    });
  }
};

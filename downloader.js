const path = require("path"),
os = process.platform === "linux" ? "lnx" : "win",
fileSuffix = (os === "lnx" ? "sh" : "exe"),
downloadedInstallerFileName = "installer." + fileSuffix,
arch = process.arch === "x64" ? "64" : "32",
baseUrl = "http://install-versions.risevision.com/",
http = require("http"),
fs = require("fs");

module.exports = {
  downloadInstaller(version) {
    const file = fs.createWriteStream(downloadedInstallerFileName);

    return new Promise((res, rej)=>{
      sendRequest(`${baseUrl}${version}/installer-${os}-${arch}.${fileSuffix}`);

      function sendRequest(dest) {
        log.debug(`downloading ${dest}`);
        http.get(dest, (resp)=>{
          if (resp.headers.location) {
            return sendRequest(resp.headers.location);
          }

          if (resp.statusCode < 200 || resp.statusCode > 299) {
            return rej(resp.statusCode);
          }

          resp.pipe(file)
          .on("close", ()=>{
            res();
          })
          .on("error", (err)=>{console.dir(err); rej(err);});
        });
      }
    });
  },
  getDownloadedInstallerFilePath() {
    return path.join(__dirname, downloadedInstallerFileName);
  }
};

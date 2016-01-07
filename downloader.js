const path = require("path"),
os = process.platform === "linux" ? "lnx" : "win",
downloadedInstallerFileName = "installer" + (os === "lnx" ? ".sh" : ".exe"),
arch = process.arch === "x64" ? "64" : "32",
baseUrl = "http://install-versions.risevision.com/VERSION/installer-OS-ARCH.exe",
http = require("http"),
fs = require("fs");

module.exports = {
  downloadInstaller(version) {
    const file = fs.createWriteStream(downloadedInstallerFileName);

    return new Promise((res, rej)=>{
      sendRequest(baseUrl.replace("VERSION", version).replace("OS", os).replace("ARCH", arch));

      function sendRequest(dest) {
        log.debug(`downloading ${dest}`);
        http.get(dest, (resp)=>{
          if (resp.headers.location) {
            return sendRequest(resp.headers.location);
          }

          resp.pipe(file)
          .on("close", ()=>{
            res();
          })
          .on("error", (err)=>{console.dir(err); rej();});
        });
      }
    });
  },
  getDownloadedInstallerFilePath() {
    return path.join(__dirname, downloadedInstallerFileName);
  }
};

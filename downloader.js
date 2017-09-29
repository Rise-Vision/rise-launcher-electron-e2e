const path = require("path"),
network = require("rise-common-electron").network,
os = process.platform === "linux" ? "lnx" : "win",
fileSuffix = (os === "lnx" ? "sh" : "exe"),
downloadedInstallerFileName = "installer." + fileSuffix,
arch = process.arch === "x64" ? "64" : (process.arch === "arm" ? "armv7l" : "32"),
baseUrl = "http://install-versions.risevision.com/",
configFile = "display-modules",
http = require("http"),
fs = require("fs");

module.exports = {
  downloadInstaller(version) {
    const file = fs.createWriteStream(downloadedInstallerFileName);

    return new Promise((res, rej)=>{
      sendRequest(`${baseUrl}staging/${version}/installer-${os}-${arch}.${fileSuffix}`);

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
  },
  getProductionVersionNumber() {
    return network.httpFetch(`${baseUrl}${configFile}-${os}-${arch}.json`)
    .then((resp)=>{
      return resp.json();
    }).then((json)=>{
      return json.Modules.filter((mod)=>{return mod.Name === "Launcher";})[0].Version;
    });
  }
};

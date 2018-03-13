const path = require("path"),
network = require("rise-common-electron").network,
os = process.platform === "linux" ? "lnx" : "win",
fileSuffix = (os === "lnx" ? "sh" : "exe"),
downloadedInstallerFileName = "installer." + fileSuffix,
arch = process.arch === "x64" ? "64" : (process.arch === "arm" ? "arm" : "32"),
baseUrl = "http://install-versions.risevision.com/",
configFile = "display-modules",
http = require("http"),
https = require("https"),
fs = require("fs");

module.exports = {
  downloadInstaller(manifest) {
    const file = fs.createWriteStream(downloadedInstallerFileName);

    return new Promise((res, rej)=>{
      const dest = manifest.modules.find(m=>m.name === "launcher").url;
      const fn = dest.startsWith("https") ? https : http;

      log.debug(`downloading ${dest}`);
      fn.get(dest, (resp)=>{
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
    });
  },
  getDownloadedInstallerFilePath() {
    return path.join(__dirname, downloadedInstallerFileName);
  },
  getRemoteManifest() {
    return network.httpFetch(`${baseUrl}${configFile}-${os}-${arch}.json`)
    .then((resp)=>{
      return resp.json();
    });
  }
};

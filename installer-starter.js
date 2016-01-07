const downloader = require("./downloader.js"),
platform = require("rise-common-electron").platform;

module.exports = {
  startDownloadedInstaller() {
    var downloadedFilePath = downloader.getDownloadedInstallerFilePath();
    log.debug("starting downloaded installer");
    platform.startProcess(downloadedFilePath, ["--unattended", "--rollout-pct=0"]);
  },
  startInstalledVersionForUpgrade(version) {
    log.debug("starting installed installer");
    platform.startProcess(platform.getInstallerPath(version), ["--unattended", "--rollout-pct=100"]);
  }
};

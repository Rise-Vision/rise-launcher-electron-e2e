const downloader = require("./downloader.js"),
platform = require("rise-common-electron").platform,
linuxExtractorOptions = ["--nox11", "--", "--unattended", "--rollout-pct=0", "--skip-countdown"],
windowsExtractorOptions = ["--unattended", "--rollout-pct=0", "--skip-countdown"];

module.exports = {
  startDownloadedInstaller() {
    var downloadedFilePath = downloader.getDownloadedInstallerFilePath(),
    extractorOptions = platform.isWindows() ? windowsExtractorOptions : linuxExtractorOptions;

    log.debug("starting downloaded installer");
    platform.startProcess(downloadedFilePath, extractorOptions);
  },
  startInstalledVersionForUpgrade(version) {
    log.debug("starting installed installer");
    platform.startProcess(platform.getInstallerPath(version), ["--unattended", "--rollout-pct=100", "--skip-countdown"]);
  }
};

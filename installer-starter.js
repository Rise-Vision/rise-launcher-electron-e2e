const downloader = require("./downloader.js"),
launcherUtils = require("./utils/launcher-utils.js"),
platform = require("rise-common-electron").platform,
linuxExtractorOptions = ["--nox11", "--", "--debug", "--unattended", "--rollout-pct=0", "--skip-countdown"],
windowsExtractorOptions = ["--unattended", "--debug", "--rollout-pct=0", "--skip-countdown"];

module.exports = {
  startDownloadedInstaller(manifestOverrideFilename) {
    var downloadedFilePath = downloader.getDownloadedInstallerFilePath(),
    extractorOptions = platform.isWindows() ? windowsExtractorOptions : linuxExtractorOptions;

    if (manifestOverrideFilename) {
      let overrideOption = `--remote-manifest-override=${manifestOverrideFilename}`;
      extractorOptions = extractorOptions.concat(overrideOption);
    }

    log.debug("starting downloaded installer");
    platform.startProcess(downloadedFilePath, extractorOptions, 9);
  },
  startInstalledVersionForUpgrade(version) {
    log.debug("starting installed installer");
    platform.startProcess(launcherUtils.getInstallerPath(version), ["--unattended", "--rollout-pct=100", "--skip-countdown"], 9);
  },
  startInstalledVersionAttended(version) {
    log.debug("starting installed installer attended");
    platform.startProcess(launcherUtils.getInstallerPath(version), [], 9);
  }
};

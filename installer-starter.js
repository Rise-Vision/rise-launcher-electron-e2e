const downloader = require("./downloader.js"),
path = require("path"),
launcherUtils = require("./utils/launcher-utils.js"),
platform = require("rise-common-electron").platform,
cp = require("child_process"),
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

    log.debug(`starting downloaded installer ${downloadedFilePath} with ${extractorOptions.join(" ")}`);
    spawn(downloadedFilePath, extractorOptions);
  },
  startInstalledVersionForUpgrade(version) {
    log.debug("starting installed installer");
    spawn(launcherUtils.getInstallerPath(version), ["--unattended", "--rollout-pct=100", "--skip-countdown"]);
  },
  startInstalledVersionAttended(version) {
    log.debug("starting installed installer attended");
    spawn(launcherUtils.getInstallerPath(version));
  }
};

function spawn(cmd, args = []) {
  const child = cp.spawn(cmd, args, {
    cwd: path.dirname(cmd),
    stdio: "inherit",
    detached: "true"
  });
  child.on("error", log.debug);
}

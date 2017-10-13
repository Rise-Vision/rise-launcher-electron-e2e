const downloader = require("./downloader.js"),
path = require("path"),
launcherUtils = require("./utils/launcher-utils.js"),
platform = require("rise-common-electron").platform,
cp = require("child_process"),
linuxExtractorOptions = ["--nox11", "--", "--unattended", "--debug", "--rollout-pct=0", "--override-limiter", "--skip-countdown"],
windowsExtractorOptions = ["--unattended", "--debug", "--rollout-pct=0", "--skip-countdown", "--override-limiter"];

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
    spawn(launcherUtils.getInstallerPath(version), ["--unattended", "--override-limiter", "--rollout-pct=100", "--skip-countdown", "--debug"]);
  },
  startInstalledVersionAttended(version) {
    log.debug("starting installed installer attended");
    spawn(launcherUtils.getInstallerPath(version));
  }
};

function spawn(cmd, args = []) {
  try {
    const child = cp.spawn(cmd, args, {
      cwd: path.dirname(cmd),
      stdio: "inherit",
      detached: "true"
    });
    child.on("error", log.debug);
  } catch(e) {
    log.debug(e);
  }
}

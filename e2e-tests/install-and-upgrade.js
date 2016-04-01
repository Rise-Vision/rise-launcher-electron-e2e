const downloader = require("../downloader.js"),
versioning = require("../versioning.js"),
cleanPrevious = require("../clean-previous.js"),
presentation = require("../presentation.js"),
cacheCheck = require("../cache-check.js");
platform = require("rise-common-electron").platform,
installerStarter = require("../installer-starter.js");

module.exports = function*(version) {
  log.debug(`Using bundle version ${version}`);
  yield cleanPrevious;

  yield downloader.downloadInstaller(version);

  yield platform.setFilePermissions(downloader.getDownloadedInstallerFilePath(), 0755);

  installerStarter.startDownloadedInstaller();

  yield versioning.checkInstalledTarget((foundTarget)=>{return foundTarget.indexOf(version) > -1;});

  yield presentation.confirmPresentationVisibility();

  yield cacheCheck();

  installerStarter.startInstalledVersionForUpgrade(version);

  yield versioning.checkInstalledTarget((foundTarget)=>{return foundTarget.indexOf(version) === -1;});

  yield presentation.confirmPresentationVisibility();

  yield (function* pass() {this.body = 200; this.status = 200;});
};

const downloader = require("../downloader.js"),
versioning = require("../versioning.js"),
cleanPrevious = require("../clean-previous.js"),
presentation = require("../presentation.js"),
cacheCheck = require("../cache-check.js"),
platform = require("rise-common-electron").platform,
installerStarter = require("../installer-starter.js");

module.exports = function*(version) {
  log.debug(`Using bundle version ${version}`);
  yield cleanPrevious;

  yield downloader.downloadInstaller(version, this).catch((err)=>{this.throw(err);});

  yield platform.setFilePermissions(downloader.getDownloadedInstallerFilePath(), 0755);

  installerStarter.startDownloadedInstaller();

  yield versioning.checkInstalledTarget((foundTarget)=>{return foundTarget.indexOf(version) > -1;}, this);

  yield presentation.confirmPresentationVisibility(this);

  yield cacheCheck(this);

  installerStarter.startInstalledVersionForUpgrade(version);

  yield versioning.checkInstalledTarget((foundTarget)=>{return foundTarget.indexOf(version) === -1;}, this);

  yield presentation.confirmPresentationVisibility(this);

  (function passed(ctx) {
    log.debug("Passed");
    ctx.body = 200;
    ctx.status = 200;
    ctx.app.context.isBusy = false;
  }(this));
};

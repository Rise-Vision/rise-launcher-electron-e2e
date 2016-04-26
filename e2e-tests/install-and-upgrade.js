const downloader = require("../downloader.js"),
versioning = require("../versioning.js"),
cleanPrevious = require("../clean-previous.js"),
presentation = require("../presentation.js"),
cacheCheck = require("../cache-check.js"),
platform = require("rise-common-electron").platform,
registry = require("../registry.js"),
installerStarter = require("../installer-starter.js");

module.exports = function*(version) {
  log.debug(`Using bundle version ${version}`);
  yield cleanPrevious;

  yield downloader.downloadInstaller(version).catch((err)=>{
    log.debug("download error " + require("util").inspect(err));
    this.throw(500);
  });

  yield platform.setFilePermissions(downloader.getDownloadedInstallerFilePath(), 0755);

  installerStarter.startDownloadedInstaller();

  yield presentation.confirmPresentationVisibility(this);

  yield versioning.checkOldVersionDeleted(this);

  yield registry.checkDpiSettings(this);

  yield cacheCheck(this);

  installerStarter.startInstalledVersionForUpgrade(version);

  yield presentation.confirmPresentationVisibility(this);

  (function passed(ctx) {
    log.debug("Passed");
    ctx.body = 200;
    ctx.status = 200;
    ctx.app.context.isBusy = false;
  }(this));

  yield cleanPrevious;
};

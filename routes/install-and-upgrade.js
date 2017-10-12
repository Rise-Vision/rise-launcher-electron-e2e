const downloader = require("../downloader.js"),
{join: pathJoin} = require("path"),
versioning = require("../versioning.js"),
cleanPrevious = require("../clean-previous.js"),
presentation = require("../presentation.js"),
cacheCheck = require("../cache-check.js"),
platform = require("rise-common-electron").platform,
registry = require("../registry.js"),
shortcuts = require("../shortcuts.js"),
proxy = require("../proxy.js"),
screenshotReq = require("../screenshot-request.js"),
contentChange = require("../content-change.js"),
argv = require('yargs').alias('p', 'port').argv,
installerStarter = require("../installer-starter.js");
manifest = require("../manifest.js");

module.exports = function*(version) {
  if (!this.request.method === "POST") {
    log.debug(`Using bundle version ${version}`);
  } else {
    let jsonString = JSON.stringify(this.request.jsonBody, null, 2);
    log.debug(`Using remote manifest overrides: ${jsonString} `);
    yield manifest.setOverrides(this.request.jsonBody);

    version = manifest.withOverrides()
    .modules.find(m=>m.name === "launcher").version;
  }

  yield cleanPrevious;

  yield downloader.downloadInstaller(manifest.withOverrides())
  .catch((err)=>{
    log.debug("download error " + require("util").inspect(err));
    this.throw(500);
  });

  yield platform.setFilePermissions(downloader.getDownloadedInstallerFilePath(), 0755);

  yield manifest.saveOverridesTo(pathJoin(platform.getHomeDir(), "rvplayer"));

  installerStarter.startDownloadedInstaller(manifest.overridesFilename());

  yield presentation.confirmPresentationVisibility(this);

  yield versioning.checkOldVersionDeleted(this);

  yield shortcuts.checkScriptsExist(this, version);

  yield shortcuts.checkShortcutsNameAndTarget(this, version);

  yield registry.checkDpiSettings(this);

  yield cacheCheck(this);

  yield screenshotReq.checkScreenshotSaved(this);

  yield contentChange.checkContentChanged(this);

  yield proxy.setupProxy();

  installerStarter.startInstalledVersionAttended(version);

  yield proxy.confirmPacScript(this);

  proxy.resetDisplayConfig();

  installerStarter.startInstalledVersionForUpgrade(version);

  yield versioning.confirmProductionInstall(version, this);

  yield presentation.confirmPresentationVisibility(this);

  (function passed(ctx) {
    log.debug("Passed");
    ctx.body = `200 OK PORT ${argv.port || 9950}`;
    ctx.status = 200;
    ctx.app.context.isBusy = false;
  }(this));

  yield cleanPrevious;
};

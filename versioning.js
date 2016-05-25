const fs = require("fs"),
platform = require("rise-common-electron").platform;

module.exports = {
  confirmProductionInstall(stagedVersion, ctx) {
    return waitForProductionInstall();

    function waitForProductionInstall() {
      try {
        fs.statSync(platform.getInstallDir(stagedVersion));
        log.debug("waiting for deletion of staged version after production version postinstall");
        return delayedRetry(waitForProductionInstall);
      } catch (err) {
        log.debug("staged version has been removed as expected");
        return;
      }
    }

    function delayedRetry(fn) {
      return new Promise((res)=>{
        ctx.timeouts.productionVersionCheck = setTimeout(()=>{
          res(fn());
        }, 4000);
      });
    }
  },
  checkOldVersionDeleted(ctx) {
    log.debug("checking that old version was deleted");
    const versionDir = platform.getInstallDir("2016.2.4");
    var oldVersionExists = true;

    try {
      fs.statSync(versionDir); // If this doesn't throw, it exists
    } catch(err){
      if (err.code === 'ENOENT') {
        oldVersionExists = false;
      }
    }

    if (!oldVersionExists) {
      return Promise.resolve();
    }

    return new Promise((res)=>{
      ctx.timeouts.oldVersionCheck = setTimeout(()=>{
        res(module.exports.checkOldVersionDeleted(ctx));
      }, 4000);
    });
  }
};

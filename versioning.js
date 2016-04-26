const fs = require("fs"),
downloader = require("./downloader.js"),
platform = require("rise-common-electron").platform;

module.exports = {
  confirmProductionInstall(ctx) {
    return downloader.getProductionVersionNumber()
    .then((prodVer)=>{
      try {
        fs.statSync(platform.getInstallDir(prodVer));
        log.debug("production version found");
        return;
      } catch (err) {
        log.debug("waiting for production version");

        return new Promise((res)=>{
          ctx.timeouts.productionVersionCheck = setTimeout(()=>{
            res(module.exports.confirmProductionInstall(ctx));
          }, 4000);
        });
      }
    });
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

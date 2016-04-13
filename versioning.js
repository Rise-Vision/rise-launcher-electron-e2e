const fs = require("fs"),
path = require("path"),
ws = require("windows-shortcuts"),
platform = require("rise-common-electron").platform,
startupLnkFilePath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk"),
ubuntuStartupFilePath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop");

function getTarget() {
  if (platform.isWindows()) {
    return new Promise((res)=>{
      ws.query(startupLnkFilePath, (err, queryResult)=>{
        if (err) {log.debug("lnk check error: " + err); return res("");}

        log.debug("installed target: " + queryResult.target);
        res(queryResult.target);
      });
    });
  } else {
    return platform.readTextFile(ubuntuStartupFilePath)
    .catch(()=>{
      return Promise.resolve("");
    });
  }
}

module.exports = {
  checkInstalledTarget(comparator, ctx) {
    log.debug("checking startup target file");

    return getTarget()
    .then((foundTarget)=>{
      if (comparator(foundTarget)) { return; }

      return new Promise((res)=>{
        ctx.timeouts.installedTarget = setTimeout(()=>{
          res(module.exports.checkInstalledTarget(comparator, ctx));
        }, 4000);
      });
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
    };

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

const fs = require("fs"),
path = require("path"),
ws = require("windows-shortcuts"),
platform = require("rise-common-electron").platform,
startupLnkFilePath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk");

function getTarget() {
  if (platform.isWindows()) {
    return new Promise((res, rej)=>{
      ws.query(startupLnkFilePath, (err, queryResult)=>{
        if (err) {log.debug("lnk check error: " + err); return res("");}

        log.debug("installed target: " + queryResult.target);
        res(queryResult.target);
      });
    });
  }
}

module.exports = {
  checkInstalledTarget(comparator) {
    log.debug("checking startup target file");
    return getTarget()
    .then((foundTarget)=>{
      if (comparator(foundTarget)) { return; }

      return new Promise((res)=>{
        setTimeout(()=>{
          res(module.exports.checkInstalledTarget(comparator));
        }, 5000);
      });
    });
  }
};

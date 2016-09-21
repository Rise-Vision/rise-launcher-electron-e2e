const execSync = require("child_process").execSync;
const path = require("path");
const cmdOpts = { cwd: path.basename(__dirname), encoding: "utf8" };

module.exports = {
  uploadFile(localFileName, remoteFileName) {
    return new Promise((res, rej)=>{
      var remoteFile = "gs://risevision-display-notifications/" + remoteFileName;
      var command = "gsutil cp " + localFileName + " " + remoteFile;

      try {
        log.debug(command);
        execSync(command, cmdOpts);
        res();
      }
      catch (err) {
        rej(err);
      }
    });
  }
};

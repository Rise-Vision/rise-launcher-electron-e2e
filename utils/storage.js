const execSync = require("child_process").execSync;
const path = require("path");
const cmdOpts = { cwd: path.basename(__dirname), encoding: "utf8" };

module.exports = {
  uploadFile(localFileName, remoteFileName) {
    return new Promise((res, rej)=>{
      var remoteFile = "gs://risevision-display-notifications/" + remoteFileName;
      var command = "gsutil cp " + localFileName + " " + remoteFile;
      var metaCommand = `gsutil setmeta -h "cache-control:private, max-age=0" ${remoteFile}`;

      try {
        log.debug(command);
        execSync(command, cmdOpts);
        execSync(metaCommand);
        res();
      }
      catch (err) {
        rej(err);
      }
    });
  }
};

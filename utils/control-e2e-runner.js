const childProcess = require("child_process"),
path = require("path"),
platform = require("rise-common-electron").platform;

const scriptPath = platform.isWindows() ?
  "cmd.exe" :
  path.join(__dirname, "..", "startup.sh");

const restartArgs = platform.isWindows() ?
  [ "/c", path.join(__dirname, "..", "background.jse"), "startup.bat" ] :
  [ ];

module.exports = {
  restart() {
    platform.startProcess(scriptPath, restartArgs);
    console.log(scriptPath, restartArgs);
  }
}

const childProcess = require("child_process"),
path = require("path"),
platform = require("rise-common-electron").platform;

const scriptName = platform.isWindows() ? "startup.bat" : "startup.sh",
scriptPath = path.join(__dirname,
                       "..",
                       scriptName);

module.exports = {
  restart() {
    platform.startProcess(scriptPath);
  }
}

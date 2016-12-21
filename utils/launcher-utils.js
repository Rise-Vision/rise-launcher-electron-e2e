const path = require("path");
const platform = require("rise-common-electron").platform;

module.exports = {
  getInstallDir(version) {
    return path.join(platform.getHomeDir(), "rvplayer", version || "");
  },
  getDisplaySettingsPath() {
    return path.join(module.exports.getInstallDir(), "RiseDisplayNetworkII.ini");
  },
  getInstallerName() {
    return platform.isWindows() ? "installer.exe" : "installer";
  },
  getInstallerDir(version) {
    return path.join(module.exports.getInstallDir(version), "Installer");
  },
  getInstallerPath(version) {
    return path.join(module.exports.getInstallerDir(version), module.exports.getInstallerName());
  }
}

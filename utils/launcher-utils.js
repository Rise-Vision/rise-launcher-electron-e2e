const path = require("path");
const platform = require("rise-common-electron").platform;

module.exports = {
  getInstallDir(version) {
    return path.join(platform.getHomeDir(), "rvplayer", version || "");
  }
}

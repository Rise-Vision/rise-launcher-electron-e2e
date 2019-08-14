var execSync = require("child_process").execSync,
platform = require("rise-common-electron").platform,
launcherUtils = require("./utils/launcher-utils.js"),
path = require("path"),
fs = require("fs"),
registry = require("./registry.js"),
shortcuts = require("./shortcuts.js"),
contentChange = require("./content-change.js"),
idCfg = fs.readFileSync(path.join(__dirname, "displayid.txt")),
killChrome = platform.isWindows() ? "taskkill /f /im chrome.exe" : "pkill -f chrome-linux",
killInstaller = platform.isWindows() ? "taskkill /f /im installer.exe" : "pkill -f installer";

module.exports = function* cleanPreviousRun() {
  yield platform.killJava();
  try {execSync(killChrome);} catch (err){}
  try {execSync(killInstaller);} catch (err){}
  yield platform.deleteRecursively(launcherUtils.getInstallDir()).catch((err)=>{log.debug(err);});
  yield platform.writeTextFile(path.join(launcherUtils.getInstallDir(), "RiseDisplayNetworkII.ini"), idCfg);
  try {fs.mkdirSync(path.join(launcherUtils.getInstallDir(), "modules", "player-electron"));} catch(err) {};
  yield platform.writeTextFile(path.join(launcherUtils.getInstallDir(), "modules", "player-electron", "electron-compat.txt"), "v1\nv2\nv3\nv4\n");
  try {fs.mkdirSync(path.join(launcherUtils.getInstallDir("2016.2.4")));} catch(err) {}
  yield registry.resetDpiSettings();
  yield platform.writeTextFile(shortcuts.getAutostartPath(), "").catch((err)=>{log.debug(err);});
  yield contentChange.restoreDefaultContent();
};
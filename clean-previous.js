var execSync = require("child_process").execSync,
platform = require("rise-common-electron").platform,
path = require("path"),
os = process.platform === "linux" ? "lnx" : "win",
fs = require("fs"),
registry = require("./registry.js"),
idCfg = fs.readFileSync(path.join(__dirname, "displayid.txt")),
startupLnkFilePath = path.join(platform.getAutoStartupPath(), "Rise Vision Player.lnk"),
ubuntuStartupFilePath = path.join(platform.getAutoStartupPath(), "rvplayer.desktop"),
startupFile = os === "lnx" ? ubuntuStartupFilePath : startupLnkFilePath,
killChrome = platform.isWindows() ? "taskkill /f /im chrome.exe" : "pkill -f chrome-linux",
killInstaller = platform.isWindows() ? "taskkill /f /im installer" : "pkill -f installer";

module.exports = function* cleanPreviousRun() {
  yield platform.killJava();
  try {execSync(killChrome);} catch (err){}
  try {execSync(killInstaller);} catch (err){}
  yield platform.deleteRecursively(platform.getInstallDir()).catch((err)=>{log.debug(err);});
  yield platform.deleteRecursively(startupFile).catch((err)=>{log.debug(err);});
  yield platform.writeTextFile(path.join(platform.getInstallDir(), "RiseDisplayNetworkII.ini"), idCfg);
  try {fs.mkdirSync(path.join(platform.getInstallDir("2016.2.4")));} catch(err) {}
  yield registry.resetDpiSettings();
};

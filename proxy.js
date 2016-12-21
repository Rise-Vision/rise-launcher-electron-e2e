const platform = require("rise-common-electron").platform,
launcherUtils = require("./utils/launcher-utils.js"),
execSync = require("child_process").execSync,
killChrome = platform.isWindows() ? "taskkill /f /im chrome.exe" : "pkill -f chrome-linux",
killInstaller = platform.isWindows() ? "taskkill /f /im installer.exe" : "pkill -f installer",
path = require("path"),
fs = require("fs"),
pacScriptPath = path.join(launcherUtils.getInstallDir(), "proxy-pac.js"),
idCfg = fs.readFileSync(path.join(__dirname, "displayid.txt"));

function checkPacScript() {
  return platform.readTextFileSync(pacScriptPath, {encoding: "utf8"})
  .includes("testhost");
}

module.exports = {
  setupProxy() {
    try {execSync(killInstaller);} catch (err){}
    try {execSync(killChrome);} catch (err){}
    fs.writeFileSync(launcherUtils.getDisplaySettingsPath(), "proxy=http://testhost:80");

    return platform.deleteRecursively(pacScriptPath);
  },
  resetDisplayConfig() {
    try {execSync(killInstaller);} catch (err){}
    try {execSync(killChrome);} catch (err){}
    fs.writeFileSync(path.join(launcherUtils.getInstallDir(), "RiseDisplayNetworkII.ini"), idCfg);
  },
  confirmPacScript(ctx) {
    log.debug("checking pac script contents");
    return new Promise((res)=>{
      ctx.timeouts.pacScript = setTimeout(()=>{
        if (checkPacScript()) {return res();}
        res(module.exports.confirmPacScript(ctx));
      }, 5000);
    });
  }
};

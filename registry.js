const Registry = require("winreg");
const platform = require("rise-common-electron").platform;
const desktopKey = new Registry({
  hive: Registry.HKCU,
  key: "\\Control Panel\\Desktop"
});

function checkDpiSettings(ctx) {
  if(!platform.isWindows()) {
    return Promise.resolve();
  }

  log.debug("Checking DPI settings");

  return new Promise((res, rej) => {
    desktopKey.values((err, registryValues) => {
      if (err) {
        return rej("DPI test failed");
      }

      var logPixels = registryValues.filter((registryValue) => registryValue.name === "LogPixels")[0],
      win8DpiScaling = registryValues.filter((registryValue) => registryValue.name === "Win8DpiScaling")[0];

      if (logPixels.value === "0x60" && win8DpiScaling.value === "0x1") {
        res();
        return;
      }

      ctx.timeouts.dpiSettingCheck = setTimeout(()=>{
        res(checkDpiSettings(ctx));
      }, 4000);
    });
  });
}

function resetDpiSettings() {
  if(!platform.isWindows()) {
    return Promise.resolve();
  }

  var scalingPromise = new Promise((res) => {
    desktopKey.set("Win8DpiScaling", "REG_DWORD", "0x0", (err) => {
      if (err) {
        throw new Error("Failed to reset scaling registry value");
      }
      res();
    });
  });
  
  var pixelsPromise = new Promise((res) => {
    desktopKey.set("LogPixels", "REG_DWORD", "0x96", (err) => {
      if (err) {
        throw new Error("Failed to reset pixel registry value");
      }
      res();
    });
  });

  return scalingPromise.then(pixelsPromise);
}

module.exports = {
  checkDpiSettings,
  resetDpiSettings
};

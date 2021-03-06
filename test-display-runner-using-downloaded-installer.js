global.log = console;
const displayId = process.argv[2];
const numberOfPrints = process.argv[3];

const platform = require("rise-common-electron").platform;
const path = require("path");
const fs = require("fs-extra");

const launcherUtils = require("./utils/launcher-utils.js");
const presentation = require("./presentation");
const installerStarter = require("./installer-starter");

const preparePlayerModule = function () {
  const playerModulePath = path.join(launcherUtils.getInstallDir(), "modules", "player-electron");
  fs.ensureDirSync(playerModulePath);
  const compatFilePath = path.join(playerModulePath, "electron-compat.txt");
  return platform.writeTextFile(compatFilePath, "v1\nv2\nv3\nv4\nv4.2.9");
}

const testDisplay = function () {
  const ctx = {timeouts: {presentation: null}};
  console.log(`Arguments: ${displayId} ${numberOfPrints}`);

  preparePlayerModule()
    .then(()=>{
      installerStarter.startDownloadedInstaller();
      presentation.confirmPresentationVisibility(ctx, "jpg", numberOfPrints)
    .then(()=>{
      console.log("Success")
      process.exit();
    })
    .catch((err)=>{
      console.log("Test error");
      process.exit(1);
    });
  })
  .catch((err)=>{
    console.log("installer start error " + require("util").inspect(err));
    process.exit(1);
  });
}
testDisplay();

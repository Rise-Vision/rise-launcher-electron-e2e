global.log = console;
const displayId = process.argv[2];
const presentationScreenshotUrl = process.argv[3];
const numberOfPrints = process.argv[4];

const downloader = require("./downloader.js");
const presentation = require("./presentation.js");
const platform = require("rise-common-electron").platform;
const installerStarter = require("./installer-starter.js");

const testDisplay = function () {
  const ctx = {timeouts: {presentation: null}};
  console.log(`Arguments: ${displayId} ${presentationScreenshotUrl}`);
  let remoteManifest = "";
  downloader.getRemoteManifest()
  .then((res)=>{
    remoteManifest = res;
    downloader.downloadInstaller(remoteManifest)
    .then(downloader.getExpectedScreenshot(presentationScreenshotUrl, "jpg")
          .then(platform.setFilePermissions(downloader.getDownloadedInstallerFilePath(), 0755)
          .then(()=>{
            // I had to add this timeout because it could not execute the installer right after it sets the permissions
            setTimeout(()=>{
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
            }, 1000);
          })))
  })
  .catch((err)=>{
    console.log("download error " + require("util").inspect(err));
    process.exit(1);
  });
}
testDisplay();


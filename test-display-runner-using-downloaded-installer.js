global.log = console;
const displayId = process.argv[2];
const numberOfPrints = process.argv[3];

const presentation = require("./presentation");
const installerStarter = require("./installer-starter");

const testDisplay = function () {
  const ctx = {timeouts: {presentation: null}};
  console.log(`Argument: ${displayId}`);

  Promise.resolve().then(()=>{
    installerStarter.startDownloadedInstaller("overriden.json");
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

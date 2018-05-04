var execSync = require("child_process").execSync,
resemble = require("node-resemble-js"),
fs = require("fs"),
os = process.platform === "linux" ? "lnx" : "win",
cmdOpts = {cwd:__dirname, encoding: "utf8"};

function checkScreen(logMessage, imageFormat) {
  return new Promise((res, rej)=>{
    log.debug(logMessage);
    execSync(getScreenshotCmd(imageFormat), cmdOpts);
    resemble(`expected-screenshot.${imageFormat}`).compareTo(`screenshot.${imageFormat}`)
    .ignoreAntialiasing()
    .onComplete(data=>{
      log.debug(data);
      data.getDiffImage().pack().pipe(fs.createWriteStream(`diff.${imageFormat}`));
      return data.misMatchPercentage >= 1 ? rej() : res();
    });
  });
}

function getScreenshotCmd(imageFormat) {
  return (os === "lnx" ? `scrot screenshot.${imageFormat}` : `nircmd.exe savescreenshot screenshot.${imageFormat}`);
}

module.exports = {
  confirmPresentationVisibility(ctx, imageFormat, numberOfAttempts) {
    return new Promise((res, rej)=>{
      ctx.timeouts.presentation = setTimeout(()=>{
        return checkScreen("taking screenshot", imageFormat)
        .then(res)
        .catch(()=>{
          if(numberOfAttempts === 0){
            return rej();
          } else {
            if(numberOfAttempts) numberOfAttempts--;
            return res(module.exports.confirmPresentationVisibility(ctx, imageFormat, numberOfAttempts));
          }
        });
      }, 5000);
    });
  },
  confirmPresentationNotDefault(ctx) {
    return new Promise((res)=>{
      ctx.timeouts.presentation = setTimeout(()=>{
        return checkScreen("taking screenshot of modified presentation")
        .then(()=>{
          return res(module.exports.confirmPresentationNotDefault(ctx));
        })
        .catch(()=>{
          return res();
        });
      }, 5000);
    });
  }
};

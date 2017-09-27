var execSync = require("child_process").execSync,
resemble = require("node-resemble-js"),
fs = require("fs"),
os = process.platform === "linux" ? "lnx" : "win",
screenshotCmd = (os === "lnx" ? "scrot screenshot.png" : "nircmd.exe savescreenshot screenshot.png"),
cmdOpts = {cwd:__dirname, encoding: "utf8"};

function checkScreen(logMessage) {
  return new Promise((res, rej)=>{
    log.debug(logMessage);
    execSync(screenshotCmd, cmdOpts);
    resemble("expected-screenshot.png").compareTo("screenshot.png")
    .ignoreAntialiasing()
    .onComplete(data=>{
      log.debug(data);
      data.getDiffImage().pack().pipe(fs.createWriteStream("diff.png"));
      return data.misMatchPercentage >= 1 ? rej() : res();
    });
  });
}

module.exports = {
  confirmPresentationVisibility(ctx) {
    return new Promise((res)=>{
      ctx.timeouts.presentation = setTimeout(()=>{
        return checkScreen("taking screenshot")
        .then(res)
        .catch(()=>{
          return res(module.exports.confirmPresentationVisibility(ctx));
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

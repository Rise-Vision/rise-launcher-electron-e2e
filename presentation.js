var execSync = require("child_process").execSync,
os = process.platform === "linux" ? "lnx" : "win",
expectedMd5 = require("fs").readFileSync("expected-md5.txt", {encoding: "utf8"}),
md5Cmd = (os === "lnx" ? "md5sum screen.png" : "certUtil -hashfile screen.png MD5"),
screenshotCmd = (os === "lnx" ? "scrot screen.png" : "nircmd.exe savescreenshot screen.png"),
cmdOpts = {cwd:__dirname, encoding: "utf8"};

function checkScreen() {
  log.debug("taking screenshot");
  execSync(screenshotCmd, cmdOpts);
  return (execSync(md5Cmd, cmdOpts).indexOf(expectedMd5) > -1);
}

module.exports = {
  confirmPresentationVisibility(ctx) {
    return new Promise((res)=>{
      ctx.timeouts.presentation = setTimeout(()=>{
        if (checkScreen()) {return res();}
        res(module.exports.confirmPresentationVisibility(ctx));
      }, 5000);
    });
  }
};

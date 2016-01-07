var execSync = require("child_process").execSync,
path = require("path"),
expectedMd5 = require("fs").readFileSync("expected-md5.txt", {encoding: "utf8"}),
md5Cmd = "certUtil -hashfile screen.png MD5",
screenshotCmd = "nircmd.exe savescreenshot screen.png",
cmdOpts = {cwd:__dirname, encoding: "utf8"};

function checkScreen() {
  log.debug("taking screenshot");
  execSync(screenshotCmd, cmdOpts);
  return (execSync(md5Cmd, cmdOpts).indexOf(expectedMd5) > -1);
}

module.exports = {
  confirmPresentationVisibility() {
    return new Promise((res)=>{
      setTimeout(()=>{
        if (checkScreen()) {return res();}
        res(module.exports.confirmPresentationVisibility());
      }, 5000);
    });
  }
};

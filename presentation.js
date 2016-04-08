var execSync = require("child_process").execSync,
os = process.platform === "linux" ? "lnx" : "win",
fs = require("fs"),
expectedMd5 = fs.readFileSync("expected-md5.txt", {encoding: "utf8"})
.split(/[^a-zA-Z0-9 ]/).filter(el=>el),
md5Cmd = (os === "lnx" ? "md5sum screen.png" : "certUtil -hashfile screen.png MD5"),
screenshotCmd = (os === "lnx" ? "scrot screen.png" : "nircmd.exe savescreenshot screen.png"),
cmdOpts = {cwd:__dirname, encoding: "utf8"};

function checkScreen() {
  var md5;
  log.debug("taking screenshot");
  execSync(screenshotCmd, cmdOpts);
  md5 = execSync(md5Cmd, cmdOpts);
  return expectedMd5.some((expected)=>{return md5.includes(expected);});
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

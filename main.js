const downloader = require("./downloader.js"),
execFileSync = require("child_process").execFileSync;

downloader.downloadInstaller()
.then(()=>{
  execFileSync("./install.exe", ["--unattended"]);
});

const http = require("http"),
url = "http://install-versions.risevision.com/installer-win-64.exe",
fs = require("fs"),
file = fs.createWriteStream("install.exe");

module.exports = {
  downloadInstaller() {
    return new Promise((res, rej)=>{
      http.get(url, (resp)=>{
        resp.pipe(file)
        .on("close", ()=>{res();})
        .on("error", (err)=>{console.dir(err); rej();});
      });
    });
  }
};

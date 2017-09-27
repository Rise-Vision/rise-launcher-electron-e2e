execSync = require("child_process").execSync;
path = require("path");
console.log(__dirname);
console.log("taking screenshot in 3s");

setTimeout(()=>{
  execSync("nircmd.exe savescreenshot screenshot.png", {cwd:__dirname});
  var k = execSync("certUtil -hashfile screenshot.png MD5", {cwd:__dirname, encoding: "utf8"});
  console.log(k);
},3000);

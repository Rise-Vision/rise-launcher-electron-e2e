execSync = require("child_process").execSync;
path = require("path");
console.log(__dirname);
console.log("taking screenshot in 10s");

setTimeout(()=>{
  execSync("nircmd.exe savescreenshot screen.png", {cwd:__dirname});
  var k = execSync("certUtil -hashfile screen.png MD5", {cwd:__dirname, encoding: "utf8"});
  console.log(k);
},10000);

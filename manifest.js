const downloader = require("./downloader.js");
const {platform} = require("rise-common-electron");
const {join: pathJoin} = require("path");
const overridesFilename = "remote-overrides.json";

let overrides;
let remoteManifest;

module.exports = {
  *setOverrides(json) {
    if (overrides) {throw Error("overrides already set");}

    overrides = Object.assign({}, json);
    yield downloader.getRemoteManifest().then(res=>(remoteManifest = res));
  },
  withOverrides() {
    return Object.assign({}, remoteManifest, overrides);
  },
  withoutOverrides() {
    return Object.assign({}, remoteManifest);
  },
  *saveOverridesTo(pathDir) {
    let fullPath = pathJoin(pathDir, overridesFilename);
    return platform.writeTextFile(fullPath, overrides);
  },
  overridesFilename() {
    return overridesFilename;
  }
};

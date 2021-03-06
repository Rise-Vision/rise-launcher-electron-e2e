const downloader = require("./downloader.js");
const {platform} = require("rise-common-electron");
const {join: pathJoin} = require("path");
const overridesFilename = "remote-overrides.json";

let overrides;
let remoteManifest;

module.exports = {
  *setOverrides(json) {
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
    const jsonString = JSON.stringify(module.exports.withOverrides(), null, 2);
    return platform.writeTextFile(fullPath, jsonString);
  },
  overridesFilename() {
    return overridesFilename;
  }
};

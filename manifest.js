const downloader = require("./downloader.js");

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
  }
};

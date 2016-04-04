const network = require("rise-common-electron").network;

function pingCache() {
  return network.httpFetch("http://localhost:9494/ping?callback=cb")
  .then((resp)=>{
    return resp.text();
  })
  .then((text)=>{
    return (text === "cb();");
  })
  .catch((err)=>{return false;});
}

module.exports = function cacheCheck() {
  log.debug("Pinging cache");
  return pingCache()
  .then((pong)=>{
    if (pong) {return true;}

    return new Promise((res)=>{
      setTimeout(()=>{
        res(cacheCheck());
      }, 5000);
    });
  });
}

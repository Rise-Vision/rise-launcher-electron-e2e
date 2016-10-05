const network = require("rise-common-electron").network;

function pingCache() {
  return network.httpFetch("http://localhost:9494/")
  .then((resp)=>{
    return resp.json();
  })
  .then((data)=>{
    return data.name === "rise-cache-v2";
  })
  .catch((err)=>{return false;});
}

module.exports = function cacheCheck(ctx) {
  log.debug("Pinging cache");
  return pingCache()
  .then((pong)=>{
    if (pong) {return true;}

    return new Promise((res)=>{
      ctx.timeouts.cacheCheck = setTimeout(()=>{
        res(cacheCheck(ctx));
      }, 5000);
    });
  });
}

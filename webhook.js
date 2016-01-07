const route = require("koa-route"),
path = require("path"),
koa = require("koa")();

koa.on("error", (err)=>{
  log.debug(`server error: ${err.message}`);
});

koa.use(function* initialFailingStatus(next) {
  log.debug(`Request for ${this.url}`);
  this.status = 503;
  this.body = 503;
  yield next;
});

koa.use(route.get("/install-and-upgrade/:version", require("./e2e-tests/install-and-upgrade.js")));

module.exports = {
  listen() {
    koa.listen(9950).timeout = 0;
    log.debug("listening on 9950");
  }
};

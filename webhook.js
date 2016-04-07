const route = require("koa-route"),
koa = require("koa")();

koa.on("error", (err)=>{
  log.debug(`server error: ${err.message}`);
  koa.context.isBusy = false;
});

koa.use(function* busy(next) {
  if (koa.context.isBusy) {return this.throw(503);}

  koa.context.isBusy = true;
  this.timeouts = {};

  this.req.on("close", handleClose(this));

  yield next;

  function handleClose(requestContext) {
    return ()=>{
      log.debug("connection closed");
      koa.context.isBusy = false;
      Object.keys(requestContext.timeouts).forEach((key)=>{
        clearTimeout(requestContext.timeouts[key]);
      });
    };
  }
});

koa.use(function* initialFailingStatus(next) {
  log.debug(`Request for ${this.url}`);
  this.status = 500;
  this.body = 500;
  yield next;
});

koa.use(route.get("/install-and-upgrade/:version", require("./e2e-tests/install-and-upgrade.js")));

module.exports = {
  listen() {
    var port = 9950;
    koa.listen(port).timeout = 60 * 1000 * 5;
    log.debug(`listening on ${port}`);
  }
};

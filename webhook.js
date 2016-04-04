const route = require("koa-route"),
path = require("path"),
koa = require("koa")();

var isBusy = false;

koa.on("error", (err)=>{
  log.debug(`server error: ${err.message}`);
  isBusy = false;
});

koa.use(function* busy(next) {
  if (isBusy) {return this.throw(503);}
  isBusy = true;
  this.req.on("close", ()=>{isBusy = false});
  yield next;
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
    koa.listen(port).timeout = 0;
    log.debug(`listening on ${port}`);
  }
};

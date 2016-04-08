const route = require("koa-route"),
koa = require("koa")(),
argv = require('yargs')
  .alias('p', 'port')
  .argv;

koa.on("error", (err, ctx)=>{
  log.debug(`server error: ${err.message}`);
  endRunCleanup(ctx);
});

function endRunCleanup(requestContext) {
  log.debug("End of run");
  koa.context.isBusy = false;

  if (typeof requestContext === "undefined" || !requestContext.timeouts) {return;}

  Object.keys(requestContext.timeouts).forEach((key)=>{
    clearTimeout(requestContext.timeouts[key]);
  });
}

koa.use(function* busy(next) {
  if (koa.context.isBusy) {return this.throw(503);}

  koa.context.isBusy = true;
  this.timeouts = {};

  this.req.on("close", endRunCleanup.bind(null, this));

  yield next;
});

koa.use(function* initialFailingStatus(next) {
  log.debug(`Request for ${this.url}`);
  this.status = 500;
  this.body = 500;
  yield next;
});

koa.use(route.get("/install-and-upgrade/:version", require("./e2e-tests/install-and-upgrade.js")));

koa.use(function* (next) {
  endRunCleanup(this);
  yield next;
});

module.exports = {
  listen() {
    var port = argv.port || 9950;
    koa.listen(port).timeout = 60 * 1000 * 5;
    log.debug(`listening on ${port}`);
  }
};

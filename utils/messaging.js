const Primus = require("primus");
const serverUrl = "https://display-messaging.risevision.com:3001/?serverkey=" + process.env.SERVERKEY,
      clientUrl = "https://display-messaging.risevision.com:3000";

module.exports = {
  createClient(displayId, handler) {
    if (!displayId) {
      throw new Error("Missing Display ID");
    }

    return createConnection(clientUrl, handler, displayId);
  },
  createServer(handler) {
    return createConnection(serverUrl, handler);
  }
};

function createConnection(url, handler, displayId) {
  let connection;

  return {
    connect() {
      return new Promise((res)=>{
        const Socket = Primus.createSocket({
          transformer: "websockets",
          parser: "json"
        });

        connection = new Socket(url);

        connection.on("data", (data)=>{
          if(handler) {
            handler(data);
          }
        });

        connection.on("error", (error)=>{
          log.external("Received a messaging error", error.stack);
        });

        connection.on("open", ()=>{
          if(displayId) {
            this.write({ msg: "register-display-id", displayId });
          }

          res();
        });

        connection.open();
      });
    },
    write(message) {
      return connection.write(message);
    }
  };
}

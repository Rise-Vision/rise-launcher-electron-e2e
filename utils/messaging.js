const Primus = require("primus");
const serverKey = process.env.SERVERKEY;
const serverUrl = "https://display-messaging.risevision.com:3001/?serverkey=" + serverKey,
      clientUrl = "https://display-messaging.risevision.com:3000";

module.exports = {
  serverKey,
  serverUrl,
  clientUrl,
  createDisplay(displayId) {
    if (!displayId) {
      throw new Error("Missing Display ID");
    }

    return createConnection(clientUrl, displayId);
  },
  createClient() {
    return createConnection(serverUrl);
  }
};

function createConnection(url, displayId) {
  let connection, clientId;

  return {
    clientId,
    connect(handler) {
      return new Promise((res)=>{
        const Socket = Primus.createSocket({
          transformer: "websockets",
          parser: "json"
        });

        connection = new Socket(url + displayId ? "&displayId=" + displayId : "");

        connection.on("data", (data)=>{
          if(handler) {
            handler(data);
          }
          else if(data.connection && !displayId) {
            clientId = data.connection.id;
          }
        });

        connection.on("error", (error)=>{
          log.external("Received a messaging error", error.stack);
        });

        connection.on("open", ()=>{
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

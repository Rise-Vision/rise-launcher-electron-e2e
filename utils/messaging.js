const Primus = require("primus");
const serverKey = process.env.MESSAGING_SERVERKEY;
const serverUrl = "https://display-messaging.risevision.com:3001/?sk=" + serverKey,
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
    return createConnection(clientUrl);
  }
};

function createConnection(url, displayId) {
  let connection, clientId;

  return {
    getClientId() { return clientId; },
    connect(handler) {
      return new Promise((res)=>{
        const Socket = Primus.createSocket({
          transformer: "websockets",
          parser: "json"
        });

        connection = new Socket(url + (displayId ? "&displayId=" + displayId : ""));

        connection.on("data", (data)=>{
          if(data.msg === "client-connected" && !displayId) {
            clientId = data.clientId;
            res();
          }

          if(handler) {
            handler(data);
          }
        });

        connection.on("error", (error)=>{
          log.external("Received a messaging error", error.stack);
        });

        connection.on("open", ()=>{
          if(displayId) {
            res();
          }
        });


        console.log("Opening connection");

        connection.open();
      });
    },
    disconnect() {
      connection.end();
    },
    write(message) {
      return connection.write(message);
    }
  };
}

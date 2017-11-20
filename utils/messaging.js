const Primus = require("primus");
const serverKey = process.env.MESSAGING_SERVERKEY;
const serverUrl = "https://services.risevision.com/messaging/core?sk=" + serverKey,
      clientUrl = "https://services.risevision.com/messaging/primus?machineId=12345";

module.exports = {
  serverKey,
  serverUrl,
  clientUrl,
  createClient(displayId = Math.random()) {
    return createConnection(clientUrl, displayId);
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
          pathname: "messaging/primus",
          parser: "json"
        });

        connection = new Socket(`${url}&displayId=${displayId}`, {manual: true});

        connection.on("data", (data)=>{
          console.dir(data);
          if(data.msg === "client-connected") {
            clientId = data.clientId;
            res();
          }

          if(handler) {
            handler(data);
          }
        });

        connection.on("error", (error)=>{
          console.dir(error);
          log.external("Received a messaging error", error.stack);
        });

        connection.on("open", ()=>{
          console.log("Connection opened");
          if(displayId !== "apps") {
            res();
          }
        });

        connection.on("close", ()=>{console.log("Connection closed");});

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

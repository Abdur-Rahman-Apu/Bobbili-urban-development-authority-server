const { Server } = require("socket.io");
const { messageCollection } = require("../../Models/collections");

const realTimeCommunication = (server) => {
  const users = [
    { id: "admin1", socketId: "", connected: false },
    { id: "admin2", socketId: "", connected: false },
  ];

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("login", (data) => {
      console.log(data, "DATA");
      const findIndex = users.findIndex((user) => user.id === data.id);
      console.log(findIndex, "FIND INDEX during connection");
      if (findIndex !== -1) {
        const userData = users[findIndex];
        userData.socketId = socket.id;
        userData.connected = true;
      } else {
        users.push({ id: data.id, socketId: socket.id, connected: true });
      }

      console.log(users, "users");
    });

    // Emit a message to the client when new data is added
    const checkUpdateMessage = messageCollection.watch();
    checkUpdateMessage.on("change", async (change) => {
      console.log(change, "Change full document");
      if (
        change?.operationType === "update" ||
        change?.operationType === "delete" ||
        change?.operationType === "insert"
      ) {
        socket.emit("check-accept-message", {
          change,
        });
      }

      if (change?.operationType === "insert") {
        socket.emit("check-new-message", { change });
      }
    });

    socket.on("check-connection", (data) => {
      const findIndex = users.findIndex((user) => user?.id === data?.id);
      if (findIndex !== -1 && users[findIndex]?.connected) {
        socket.emit("connection-status", true);
      } else {
        socket.emit("connection-status", false);
      }
    });

    socket.on("private-message", ({ to, message }) => {
      const findIndex = users.findIndex((user) => user.id === to);
      console.log("FIND INDEX PM", findIndex, to, users);
      if (findIndex !== -1) {
        console.log(message, "message");
        const toSocketId = users[findIndex].socketId;
        io.to(toSocketId).emit("private-message", message);
      }

      // {
      //   console.log(`User ${to} is not online.`);
      //   // Handle the case where the recipient is not online or doesn't exist
      //   // You may want to emit an event back to the sender indicating the issue
      //   socket.emit("private-message-error", {
      //     to,
      //     message: "User not online",
      //   });
      // }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      const findIndex = users.findIndex((user) => user.socketId === socket.id);

      console.log("Find index during disconnect", findIndex);
      if (findIndex !== -1) {
        // users.splice(findIndex, 1);
        console.log(users[findIndex], "Disconnected");
        users[findIndex].connected = false;
      }

      console.log(users);
    });
  });
};

module.exports = { realTimeCommunication };

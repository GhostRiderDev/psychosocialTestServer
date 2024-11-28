const { createServer } = require("http");
const { Server } = require("socket.io");
const { socketIO } = require("../controllers/socketController");
const app = require("../app");
const { connectToDatabase } = require("../helpers/connection");
const logger = require("morgan");

const port = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
connectToDatabase();
// Socket server
socketIO(io);
global.io = io;

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = { server, initIO: () => io };

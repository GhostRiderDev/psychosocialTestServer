const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = require("../app");
const { connectToDatabase } = require("../helpers/connection");
const {
  getCurrentTime,
  saveMessage,
  createChat,
} = require("./messageController");
const Chat = require("../models/Chat");
const Response = require("../helpers/response");

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Connect to the MongoDB database
connectToDatabase();

function socketIO(io) {
  console.log("ujhhj", io);
  console.log("Socket server is lenening on port 3000");
  io.on("connection", (socket) => {
    console.log(`${getCurrentTime()} New client connected`);

    socket.on("disconnect", () => {
      console.log(`${getCurrentTime()} Client disconnected`);
    });

    socket.on("message", async (msg, callback) => {
      try {
        console.log("hiiiiiiiii", msg.participant, "hoooooo");

        // Search for existing chat between sender and receiver, regardless of the order of senderId and participant
        const searchChat = await Chat.findOne({
          $or: [
            { senderId: msg.senderId, participant: msg.participant },
            { senderId: msg.participant, participant: msg.senderId },
          ],
        });

        // If chat does not exist, create a new one
        if (!searchChat) {
          // Create chat and wait for the result
          const newChat = await createChat(msg);
          console.log(msg);
          msg.chatId = newChat._id;
        } else {
          msg.chatId = searchChat._id;
        }

        // Save message
        const message = await saveMessage(msg);

        // Send message to specific user
        io.emit(`new::${msg.chatId}`, message);
        console.log(message);

        // Response back
        callback({
          message: message,
          type: "Message",
        });
      } catch (error) {
        console.error(error.message);
        // Handle errors here
        callback({
          error: "An error occurred while processing the message",
          type: "Error",
        });
      }
    });
  });
}

socketIO(io);

module.exports = socketIO;

// socket.on('message', async (msg, callback) => {
//     try {

//         console.log("hiiiiiiiii", msg.participant, "hoooooo");

//         // Search for existing chat between sender and receiver, regardless of the order of senderId and participant
//         const searchChat = await Chat.findOne({
//             $or: [
//                 { senderId: msg.senderId, participant: msg.participant },
//                 { senderId: msg.participant, participant: msg.senderId }
//             ]
//         });

//         // If chat does not exist, create a new one
//         if (!searchChat) {
//             // Create chat and wait for the result
//             const newChat = await createChat(msg);
//             console.log(msg)
//             msg.chatId = newChat._id;
//         } else {
//             msg.chatId = searchChat._id;
//         }

//         // Save message
//         const message = await saveMessage(msg);

//         // Send message to specific user
//         io.emit(`new::${msg.chatId}`, message);
//         console.log(message)

//         // Response back
//         callback({
//             message: message,
//             type: "Message",
//         });

//     } catch (error) {
//         console.error(error.message);
//         // Handle errors here
//         callback({
//             error: "An error occurred while processing the message",
//             type: "Error",
//         });
//     }
// });

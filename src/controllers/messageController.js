const { mongoose } = require("mongoose");
const Response = require("../helpers/response");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const Therapist = require("../models/Therapist");

//Timestamp function for socket
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

//Save message to database
const saveMessage = (msg) => {
  // console.log("hiiiiiiiii", msg)
  // if (!msg.message) {
  //     return;
  // }
  const saveMessage = Message.create({
    message: msg.message,
    senderId: msg.senderId,
    participant: msg.participant,
    chatId: msg.chatId,
    publicFileURL: msg.publicFileURL,
    path: msg.publicFileURL,
    messageType: msg.messageType,
    sendTime: getCurrentTime(),
  });
  return saveMessage;
};

const createChat = async (msg) => {
  const newChat = Chat.create({
    senderId: msg.senderId,
    participant: msg.participant,
  });
  return newChat;
};

const getUserSpecificChat = async (req, res) => {
  try {
    const search = req.query.search || ""; // Ensure search is not undefined
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const participant = req.params.participant;
    const senderId = req.body.userId;

    // Find messages where senderId and participant match, or vice versa
    const query = {
      $and: [
        {
          $or: [
            { senderId: senderId, participant: participant },
            { senderId: participant, participant: senderId },
          ],
        },
        // { message: { $exists: true } } // Ensure the message field exists
      ],
    };

    // Count total number of messages
    const totalMessages = await Message.countDocuments(query);

    // Fetch messages with pagination
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(
      Response({
        data: messages,
        pagination: {
          totalPages: Math.ceil(totalMessages / limit),
          currentPage: page,
          totalMessages: totalMessages,
        },
        statusCode: 200,
        status: "Okay",
        message: "Messages retrieved successfully",
      })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getUserSpecificChat = async (req, res) => {
//     try {
//         const chatId = req.params.participant;
//         console.log(chatId)
//         const specificChat = await Message.find({ chatId: chatId });
//         res.status(200).json(Response({ message: "Your chat retrieve succesfuly", data: specificChat }))
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getChatList = async (req, res) => {
  try {
    const senderId = req.body.userId;

    // Find chat
    const chats = await Chat.find({
      $or: [{ senderId: senderId }, { participant: senderId }],
    });

    // Extract chat IDs
    const chatIds = chats.map((chat) => chat._id);

    // Group messages by chatId and retrieve only the last message for each chat
    const chatMessages = await Message.aggregate([
      {
        $match: {
          chatId: { $in: chatIds },
          message: { $exists: true }, // Ensure the message field exists
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Combine chats with their last messages
    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const chatMessagesObj = chatMessages.find(
          (msg) => msg._id.toString() === chat._id.toString()
        );
        let participant;
        if (chat.senderId.toString() === senderId) {
          participant = chat.participant;
        } else {
          participant = chat.senderId;
        }
        const participantDetails =
          (await User.findById(participant)) ||
          (await Therapist.findById(participant));
        return {
          chat: chat,
          participantDetails: participantDetails,
          lastMessage: chatMessagesObj ? chatMessagesObj.lastMessage : null,
        };
      })
    );

    // Now you can send the chatList in the response
    res.status(200).json(Response({ data: chatList }));
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const fileMessage = async (req, res) => {
  try {
    const { senderId, participant, message, messageType } = req.body;
    const file = req.file;
    // if (!file) {
    //     return res.status(400).json({ error: "No file uploaded" });
    // }

    // let newMessageType;

    // if (!file && !message) {
    //     return res.status(400).json({ error: "No file or message uploaded" });
    // } else if (file && message) {
    //     newMessageType = 'text/image';
    // } else if (file) {
    //     newMessageType = "image";
    // } else if (message) {
    //     newMessageType = 'text';
    // }

    // else if (message) {
    //     newMessageType = 'text';
    // }

    const modifiedFile = {
      publicFileURL: file.path,
      path: file.path,
      senderId,
      participant,
      messageType: messageType,
      message,
    };
    console.log(modifiedFile);
    // console.log(newMessageType)
    // Search for existing chat between sender and receiver, regardless of the order of senderId and participant
    const searchChat = await Chat.findOne({
      $or: [
        { senderId: senderId, participant: participant },
        { senderId: participant, participant: senderId },
      ],
    });

    // If chat does not exist, create a new one
    if (!searchChat) {
      // Create chat and wait for the result
      const newChat = await createChat(modifiedFile);
      modifiedFile.chatId = newChat._id;
    } else {
      modifiedFile.chatId = searchChat._id;
    }

    // Save message
    const newMessage = await saveMessage(modifiedFile);
    io.emit(`new::${modifiedFile.chatId}`, newMessage);
    return res.status(200).json(newMessage);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCurrentTime,
  saveMessage,
  createChat,
  getUserSpecificChat,
  getChatList,
  fileMessage,
};

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
  /*#swagger.tags = ['Message']
    #swagger.description = 'Endpoint to get messages between two users'
  #swagger.parameters['participant'] = {
          in: 'path',
          description: 'The ID of the user to get messages with',
          required: true,
          type: 'string'
      }
  #swagger.responses[200] = {
          description: 'Messages retrieved successfully',
          schema: { $ref: "#/definitions/Message" }
      }
  #swagger.responses[500] = {
          description: 'Server Error',
          schema: { $ref: "#/definitions/Error" }
      }
  #swagger.security = [{
          "apiKeyAuth": []
      }]*/
};

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
        console.log("chatMessagesObj: ->>>>", chat.senderId, senderId);
        if (chat.senderId.toString() === senderId) {
          participant = chat.participant;
          console.log("**: ->>>>", chat.senderId, senderId);
        } else {
          participant = chat.senderId;
          console.log("^^: ->>>>", chat.senderId, senderId);
        }
        const participantDetails =
          (await User.findById(participant)) ||
          (await Therapist.findById(participant));

        console.log("participantDetails: ->>>>", participant, req.body.userId);
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
  /*#swagger.tags = ['Message']
    #swagger.description = 'Endpoint to get a list of chats'
  #swagger.responses[200] = {
          description: 'Chats retrieved successfully',
          schema: { $ref: "#/definitions/Chat" }
      }
  #swagger.responses[500] = {
          description: 'Server Error',
          schema: { $ref: "#/definitions/Error" }
      }
  #swagger.security = [{
          "apiKeyAuth": []
      }]*/
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
  /*#swagger.tags = ['Message']
    #swagger.description = 'Endpoint to send a file message'
  #swagger.parameters['senderId'] = {
          in: 'body',
          description: 'The ID of the sender',
          required: true,
          type: 'string'
      }
  #swagger.parameters['participant'] = {
          in: 'body',
          description: 'The ID of the participant',
          required: true,
          type: 'string'
      }
  #swagger.parameters['message'] = {
          in: 'body',
          description: 'The message to send',
          required: false,
          type: 'string'
      }
  #swagger.parameters['messageType'] = {
          in: 'body',
          description: 'The type of message to send',
          required: true,
          type: 'string'
      }
  #swagger.parameters['file'] = {
          in: 'body',
          description: 'The file to send',
          required: false,
          type: 'file'
      }
  #swagger.responses[200] = {
          description: 'Message sent successfully',
          schema: { $ref: "#/definitions/Message" }
      }
  #swagger.responses[500] = {
          description: 'Server Error',
          schema: { $ref: "#/definitions/Error" }
      }
  #swagger.security = [{
          "apiKeyAuth": []
      }]*/
};

module.exports = {
  getCurrentTime,
  saveMessage,
  createChat,
  getUserSpecificChat,
  getChatList,
  fileMessage,
};

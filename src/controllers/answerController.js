const Response = require("../helpers/response");
const Answer = require("../models/Answer");
const Servey = require("../models/Servey");
const User = require("../models/User");

const answer = async (req, res) => {
  try {
    console.log("meow");
    const answerData = req.body;
    const userId = req.body.userId;
    // const therapyType = req.body.therapyType;

    console.log(answerData);

    // Function to retrieve therapyType
    const getTherapyType = (dataArray) => {
      for (const item of dataArray) {
        if (item.therapyType) {
          return item.therapyType;
        }
      }
      return null; // or a default value if not found
    };

    const therapyType = getTherapyType(answerData);
    console.log("Therapy Type:", therapyType);

    const user = await User.findById(req.body.userId);
    console.log(user);
    if (!user) {
      return res.status(404).json(Response({ message: "User not found" }));
    }
    if (user.answer == true) {
      return res
        .status(400)
        .json(Response({ message: "You already answered" }));
    }

    const newAnswer = await Answer({
      answer: answerData,
      userId: userId,
    }); // Create new instance of Answer model
    await newAnswer.save(); // Save the new answer

    user.answer = true;
    user.therapyType = therapyType;
    await user.save();

    // Send response only after all asynchronous operations are complete
    res.status(200).json({ newAnswer });
  } catch (error) {
    console.log(error.message);
    // If an error occurs, send an error response
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyAnswerByAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("------------->>>>>>>>>");
    console.log(userId);
    const answeredByUser = await Answer.find({ userId: userId });
    console.log(answeredByUser);
    res
      .status(200)
      .json(
        Response({
          message: "User answer succesfuly",
          data: answeredByUser,
          status: "Okay",
          statusCode: 200,
        })
      );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(Response({ message: "Internal server Error" }));
  }
};
module.exports = { answer, verifyAnswerByAdmin };

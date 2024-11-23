const Response = require("../helpers/response");
const Survey = require("../models/Servey");
const SurveyAnswer = require("../models/ServeyAnswer");

const createServey = async (req, res) => {
  try {
    const { question, options, questionType, answerType } = req.body;
    const survey = await Survey.create({
      question,
      options,
      questionType,
      answerType,
    });
    res
      .status(201)
      .json(
        Response({
          data: survey,
          status: "Created",
          statusCode: 201,
          message: "Servey created successfully",
        })
      );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(Response({ error: error }));
  }
};

const getSurvey = async (req, res) => {
  try {
    const questionType = req.query.questionType || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const searchRegExp = new RegExp(".*" + questionType + ".*", "i");

    const filter = {
      $or: [{ questionType: { $regex: searchRegExp } }],
    };

    const surveys = await Survey.find(filter);

    const responseData = {
      data: surveys,
      type: questionType,
    };

    res.status(200).json(Response(responseData));
  } catch (error) {
    res.status(500).json(Response({ error: error }));
  }
};

const getServeyAnswer = async (req, res) => {
  try {
    let surveyQuestionWithAnswer = [];

    // Retrieve all survey answers
    const surveyAnswers = await SurveyAnswer.find();

    // Extract questionIds from survey answers
    const questionIds = surveyAnswers.map((answer) => answer.questionId);

    // Retrieve questions based on the extracted questionIds
    const questions = await Survey.find({ _id: { $in: questionIds } });

    // Associate each survey answer with its corresponding question
    surveyQuestionWithAnswer = surveyAnswers.map((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return {
        _id: answer._id,
        questionId: answer.questionId,
        question: question, // Adding question to the object
        answers: answer.answers,
        correctAnswers: answer.correctAnswers,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        __v: answer.__v,
      };
    });

    res.status(200).json({ data: surveyQuestionWithAnswer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getServeyWithoutAnswer = async (req, res) => {
  try {
    let surveyQuestionWithAnswer = [];

    // Retrieve all survey answers
    const surveyAnswers = await SurveyAnswer.find();

    // Extract questionIds from survey answers
    const questionIds = surveyAnswers.map((answer) => answer.questionId);

    // Retrieve questions based on the extracted questionIds
    const questions = await Survey.find({ _id: { $in: questionIds } });

    // Associate each survey answer with its corresponding question
    surveyQuestionWithAnswer = surveyAnswers.map((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return {
        _id: answer._id,
        questionId: answer.questionId,
        question: question, // Adding question to the object
        answers: answer.answers,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
        __v: answer.__v,
      };
    });

    res.status(200).json({ data: surveyQuestionWithAnswer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const serveyAnswer = async (req, res) => {
  try {
    const { questionId, answers, correctAnswers } = req.body;

    const createAnswer = await SurveyAnswer.create({
      answers: answers,
      correctAnswers: correctAnswers,
      questionId: questionId,
    });

    res.status(201).json(Response({ data: createAnswer }));
  } catch (error) {
    res.status(500).json(Response({ error: error }));
  }
};

module.exports = {
  createServey,
  getSurvey,
  getServeyAnswer,
  getServeyWithoutAnswer,
};

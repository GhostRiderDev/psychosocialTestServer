const Response = require("../helpers/response");
const TimeSceidule = require("../models/TimeSceidule");

const createSceiduleByAdmin = async (req, res) => {
  try {
    const { sheidule, name } = req.body;
    const newSceidule = await TimeSceidule.create({
      sheidule: sheidule,
      name: name,
    });
    res
      .status(201)
      .json(
        Response({
          message: "Sceidule created successfully",
          data: newSceidule,
          status: 201,
          success: true,
        })
      );
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json(
        Response({
          message: "Internal server error",
          status: 500,
          success: false,
        })
      );
  }
};

const getSceidule = async (req, res) => {
  try {
    const sceidule = await TimeSceidule.find();
    res
      .status(200)
      .json(
        Response({
          message: "Sceidule fetched successfully",
          data: sceidule,
          status: 200,
          success: true,
        })
      );
  } catch (error) {
    res
      .status(500)
      .json(
        Response({
          message: "Internal server error",
          status: 500,
          success: false,
        })
      );
  }
};

module.exports = { createSceiduleByAdmin };

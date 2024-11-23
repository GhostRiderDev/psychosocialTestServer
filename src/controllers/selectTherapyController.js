const Response = require("../helpers/response");
const SelectTherapy = require("../models/SelectTherapy");

const chooseTherapy = async (req, res) => {
  try {
    console.log(req.body.therapyName);
    const choosenTherapy = await SelectTherapy.create({
      therapyName: req.body.theapyName,
      patientId: req.body.patientId,
    });

    res
      .status(200)
      .json(
        Response({
          data: choosenTherapy,
          statusCode: 200,
          message: "Therapy select succesfully",
          status: "Okay",
          type: "Therapy",
        })
      );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(Response(error.message));
  }
};

module.exports = {
  chooseTherapy,
};

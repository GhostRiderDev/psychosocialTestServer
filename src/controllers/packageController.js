const Response = require("../helpers/response");
const Apointment = require("../models/Apointment");
const Package = require("../models/Package");

const createPackage = async (req, res) => {
  const { name, price, description } = req.body;
  const checkAdmin = req.body.userId;
  if (!checkAdmin) {
    res
      .status(401)
      .json(
        Response({
          message: "Unauthorized",
          type: "Package",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
  }
  const package = await Package.create({ name, price, description });

  res
    .status(201)
    .json(
      Response({
        message: "Package created successfully",
        data: package,
        type: "Package",
        status: "Created",
        stausCode: 201,
      })
    );
};

const getPackages = async (req, res) => {
  const packages = await Package.find();
  res
    .status(200)
    .json(
      Response({
        message: "Packages fetched successfully",
        data: packages,
        type: "Packages",
        status: "OK",
        statusCode: 200,
      })
    );
};

const selectPackage = async (req, res) => {
  const { packageId, date, time } = req.body;
  const package = await Package.findById(packageId);
  if (!package) {
    res
      .status(404)
      .json(
        Response({
          message: "Package not found",
          type: "Package",
          status: "Not Found",
          statusCode: 404,
        })
      );
    return;
  }
  const user = req.body.userId;
  if (!user) {
    res
      .status(401)
      .json(
        Response({
          message: "Unauthorized",
          type: "Package",
          status: "Unauthorized",
          statusCode: 401,
        })
      );
  }
  const apointment = await Apointment.create({
    userId: user,
    packageId,
    date,
    time,
  });

  res
    .status(200)
    .json(
      Response({
        message: "Package selected successfully",
        data: apointment,
        type: "Package",
        status: "OK",
        statusCode: 200,
      })
    );
};

module.exports = {
  createPackage,
  getPackages,
  selectPackage,
};

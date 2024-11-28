const Response = require("../helpers/response");
const SubsCriptionPlan = require("../models/SubsCriptionPlan");
const Subscription = require("../models/Subscription");

const createSubscription = async (req, res) => {
  console.log("createSubscription");
  try {
    const { title, price, duration, description, sessionCount, planType } =
      req.body;
    const sunbcriptionPlan = await SubsCriptionPlan.create({
      title,
      price,
      duration,
      description,
      sessionCount,
      planType,
    });
    res.status(201).json(
      Response({
        message: "Subscription plan created successfully",
        status: "Created",
        statusCode: 201,
        data: sunbcriptionPlan,
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(
      Response({
        message: "Error creating plan",
        status: "Error",
        stausCode: 500,
      })
    );
  }
  /*#swagger.tags = ['Subscription']
    #swagger.description = 'Endpoint to create subscription plan'
    } */
};

const getSubscription = async (req, res) => {
  console.log("Fetching subscription plans...");
  try {
    const search = req.query.search || "";
    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    const subscriptionPlans = await SubsCriptionPlan.find({
      planType: {
        $regex: searchRegExp,
      },
    });

    res.status(200).json({
      message: "Subscription plan fetched successfully",
      status: "Success",
      statusCode: 200,
      data: subscriptionPlans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error.message);
    res.status(500).json({
      message: "Error fetching plan",
      status: "Error",
      statusCode: 500,
    });
  }
  /*#swagger.tags = ['Subscription']
    #swagger.description = 'Endpoint to get subscription plans'
    } */
};

const updateSubscription = async (req, res) => {
  console.log("updateSubscription");
  try {
    const { title, price, duration, description } = req.body;
    const suncriptionPlan = await SubsCriptionPlan.findByIdAndUpdate(
      req.params.id,
      { title, price, duration, description }
    );
    res.status(200).json(
      Response({
        message: "Subscription plan updated successfully",
        status: "Success",
        stausCode: 200,
        data: suncriptionPlan,
      })
    );
  } catch (error) {
    res.status(500).json(
      Response({
        message: "Error updating plan",
        status: "Error",
        stausCode: 500,
      })
    );
  }
  /*#swagger.tags = ['Subscription']
    #swagger.description = 'Endpoint to update subscription plan'
    } */
};

const deleteSubscription = async (req, res) => {
  console.log("deleteSubscription");
  try {
    const suncriptionPlan = await SubsCriptionPlan.findByIdAndDelete(
      req.params.id
    );
    res.status(200).json(
      Response({
        message: "Subscription plan deleted successfully",
        status: "Success",
        stausCode: 200,
        data: suncriptionPlan,
      })
    );
  } catch (error) {
    res.status(500).json(
      Response({
        message: "Error deleting plan",
        status: "Error",
        stausCode: 500,
      })
    );
  }
  /*#swagger.tags = ['Subscription']
    #swagger.description = 'Endpoint to delete subscription plan'
    } */
};

//Buy subscription plan
const buySubscription = async (req, res) => {
  console.log("buySubscription");
  try {
    const planId = req.params.planId;
    const transactionId = req.body.transactionId;
    const userId = req.body.userId;
    const payment = req.body.payment;
    console.log(transactionId);
    const subcriptionPlan = await SubsCriptionPlan.findById(planId);
    console.log(subcriptionPlan);
    if (!subcriptionPlan) {
      return res.status(404).json(
        Response({
          message: "Plan not found",
          status: "Error",
          stausCode: 404,
        })
      );
    }
    const checkSubscription = await Subscription.findOne({ userId: userId });
    if (checkSubscription) {
      return res
        .status(400)
        .json(Response({ message: "You already subcribed a plan" }));
    }
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + subcriptionPlan.duration * 24 * 60 * 60 * 1000
    ); // Adding duration in milliseconds

    const subscription = await Subscription.create({
      planId,
      price: subcriptionPlan.price,
      userId: userId,
      payment: payment,
      startDate,
      sessionCount: subcriptionPlan.sessionCount,
      duaration: subcriptionPlan.duration,
      endDate,
      transactionId: req.body.transactionId,
    });

    res.status(200).json(
      Response({
        message: "Subscription plan bought successfully",
        status: "Success",
        stausCode: 200,
        data: subcriptionPlan,
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(
      Response({
        message: "Error buying plan",
        status: "Error",
        stausCode: 500,
      })
    );
  }
  /*#swagger.tags = ['Subscription']
    #swagger.description = 'Endpoint to buy subscription plan'
    } */
};

module.exports = {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscription,
  buySubscription,
};

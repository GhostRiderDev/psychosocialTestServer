const Notification = require("../models/Notification");
const Sheidule = require("../models/Sheidule");

const sendNotification = async (req, res) => {
    try {
        const checkSchedule = await Sheidule.find({
            userId: { $exists: true, $ne: null }
        });
        console.log(checkSchedule);
    } catch {
        res.status(500).json("Internal server error");
    }
};

const getNotification = async (req, res) => {
    try {
        const userId = req.user // Assuming userId is passed as a URL parameter
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const notifications = await Notification.find({ userId: userId });

        if (notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found for this user' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports = { sendNotification, getNotification };
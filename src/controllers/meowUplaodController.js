const mewoImageUpload = async (req, res) => {
    try {
        // Access uploaded files
        const image = req.files['image'];
        const certificate = req.files['certificate'];
        const resume = req.files['resume'];
        console.log(image);

        // Process uploaded files as needed
        // For example, save them to a database or file system

        res.status(200).json({ message: "Images uploaded successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { mewoImageUpload };

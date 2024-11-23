const fs = require('fs');

const deleteImage = async (imagePath) => {
    fs.access(imagePath, (err) => {
        if (err) {
            console.log("Image not found");
        } else {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            })
        }
    });
};

module.exports = { deleteImage };
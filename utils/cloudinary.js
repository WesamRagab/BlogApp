const cloudinary = require('cloudinary');

// Initialize cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//cloudinary upload image

const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
           resource_type: 'auto',
        }); 

        return data;
    } catch (error) {
        // console.error('Error uploading image:', error);
        return error;
    }
};

const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const result = await cloudinary.uploader.destroy(imagePublicId);
      

        return result;
    } catch (error) {
        // console.error('Error Deleting image:', error);
        return error;
    }
};

// Cloudinary remove multiple images

const cloudinaryRemoveMultipleImages = async (PublicIds) => {
    try {
        const result = await cloudinary.v2.api.delete_resources(PublicIds);
        return result;
    } catch (error) {
        // console.error('Error Deleting multiple images:', error);
        return error;
    }
};

module.exports = { 
    cloudinaryUploadImage,
    cloudinaryRemoveImage ,
    cloudinaryRemoveMultipleImages
};

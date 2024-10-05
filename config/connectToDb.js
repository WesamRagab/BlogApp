const mongoose = require('mongoose');

module.exports = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB' , process.env.MONGO_URI);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
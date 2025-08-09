
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB connected successfully');
    } catch (err) {
        console.error('Error connecting to DB', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;

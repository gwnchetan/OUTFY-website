const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // A small, warm pool is a better fit for a single Render instance
            // than opening MongoDB's large default pool on each deployment.
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 10_000,
            waitQueueTimeoutMS: 10_000,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

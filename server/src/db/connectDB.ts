import mongoose from "mongoose";

// GridFS Bucket variable
let gridFSBucket:any;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGO_DB_URL}`);
    // Initialize GridFSBucket after MongoDB connection is established
    const db = connection.connection.db;
    if (!db) {
      throw new Error("MongoDB database connection is not established yet.");
    }
    gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads", // You can change the bucket name as needed
    });
  } catch (error) {
    process.exit(1); // Terminate the Node process due to connection failure
  }
};

export { connectDB, gridFSBucket };

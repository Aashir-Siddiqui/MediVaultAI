import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const db = mongoose.connection;
    console.log("DB connected to:", db.name);
  } catch (error) {
    console.log("DB connection error:", error.message);
  }
};

export default connectDB;

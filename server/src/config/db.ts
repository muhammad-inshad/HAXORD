import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database connection error", error);
    process.exit(1);
  }
};

export default connectDB;
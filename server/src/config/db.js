import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}${DB_NAME}`
    );
    console.log(
      `Connected to Database successfully at ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Failed to connect to Database ${error.message}`);
    process.exit(1);
  }
};

export { connectDB };

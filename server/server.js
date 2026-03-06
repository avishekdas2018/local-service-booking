import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

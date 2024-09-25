import express from "express";
import cors from "cors";
import mongoose from "mongoose"; // Import mongoose to connect to MongoDB
import dotenv from "dotenv"; // Import dotenv to handle environment variables
import records from "./routes/record.js"; // Existing route for records

dotenv.config(); // Load environment variables from config.env

const PORT = process.env.PORT || 5050;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.ATLAS_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.use("/record", records);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

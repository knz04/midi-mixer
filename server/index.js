const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();

// database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected"));

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/", require("./routes/authRoutes"));

const PORT = process.env.PORT | 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
require("dotenv").config();        // Load environment variables
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Parse JSON request body
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route (very important for debugging)
app.get("/", (req, res) => {
  res.send("Auth API running");
});

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

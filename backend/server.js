import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import collaborationRoutes from "./routes/collaboration.route.js";
// import applicationRoutes from "./routes/applicationRoutes.js";

// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

// Database
connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/collaborations", collaborationRoutes);
// app.use("/api/applications", applicationRoutes);

app.use((req, res, next) => {
  res.status(404);
  next(new Error("Route not found"));
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

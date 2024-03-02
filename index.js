const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const mongoose = require("mongoose");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");
const usersRoutes = require("./routes/usersRoutes");
const path = require("path");

// Start express app
const app = express();

// Allow options method
app.options("*", cors());

// Implement CORS
const whitelist = [process.env.CLIENT_URL];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// app.use(cors(corsOptions));
app.use(cors());

// Setting security http headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Serving static files
app.use("/api/v1/public", express.static(path.join(__dirname, "public")));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan());
}

// Limiting requests from the same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});

app.use("/api", limiter);

// Body parsing
app.use(express.json({ limit: "10kb" }));

// Data sanitization agains NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connection successful!"));

// Routes
app.use("/api/v1/users", usersRoutes);

// Catch all routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling
app.use(globalErrorHandler);

// Start app listening
const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`App running on port ${port}...`));

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally uploaded files with proper MIME types for video
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/mp4',
    };
    if (mimeMap[ext]) {
      res.setHeader('Content-Type', mimeMap[ext]);
    }
  }
}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));

app.use("/api/orders", require("./routes/orders"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/homepage", require("./routes/homepage"));
app.use("/api/catalogue", require("./routes/catalogue"));
app.use("/api/banners", require("./routes/banners"));
app.use("/api/navigation", require("./routes/navigation"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/cms", require("./routes/cms"));
app.use("/api/benefits", require("./routes/benefits"));
app.use("/api/media", require("./routes/media"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/shipping", require("./routes/shipping"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/newsletter", require("./routes/newsletter"));

app.get("/api/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

// Global error handler
app.use((err, req, res, next) => {
  // Handle multer file size errors gracefully
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum allowed size is 200MB.' });
  }
  if (err.message && err.message.includes('Only image or video files are allowed')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

module.exports = app;

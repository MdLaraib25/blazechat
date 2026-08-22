require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const roomHandlers = require("./handlers/roomHandlers");
const messageHandlers = require("./handlers/messageHandlers");
const typingHandlers = require("./handlers/typingHandlers");

const app = express();
const server = http.createServer(app);

const DEFAULT_CLIENT_URLS = [
  "http://localhost:5173",
  "https://blazechat-frontend.vercel.app",
];

function normalizeOrigin(origin) {
  return origin.replace(/\/$/, "");
}

const envClientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...DEFAULT_CLIENT_URLS, ...envClientUrls]
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(normalizeOrigin(origin));
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Blazechat server is running");
});

io.on("connection", (socket) => {
  roomHandlers(io, socket);
  messageHandlers(io, socket);
  typingHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Blazechat server running on port ${PORT}`);
});

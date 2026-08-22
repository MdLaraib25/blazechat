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
  "https://blazechat-three.vercel.app",
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
  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow Vercel preview deployments for this frontend project.
  return /^https:\/\/blazechat-three-[a-z0-9-]+\.vercel\.app$/i.test(
    normalizedOrigin
  );
}

function corsOriginHandler(origin, callback) {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  console.warn(`Blocked origin: ${origin}`);
  callback(null, false);
}

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST"],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});

app.use(
  cors({
    origin: corsOriginHandler,
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

import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// Nạp chính xác lớp cấu hình từ gói cài đặt gốc
const { GitHubServer } = require("@modelcontextprotocol/server-github/dist/index.js");

const app = express();
const port = process.env.PORT || 10000;

// Khởi tạo máy chủ GitHub MCP chính thức
const githubServer = new GitHubServer();

let sseTransport = null;

app.get("/sse", (req, res) => {
  sseTransport = new SSEServerTransport("/messages", res);
  githubServer.connect(sseTransport).catch((err) => {
    console.error("Lỗi kết nối giao thức:", err);
  });
});

app.post("/messages", (req, res) => {
  if (sseTransport) {
    sseTransport.handleMessage(req, res);
  } else {
    res.status(400).send("Chưa khởi tạo cổng kết nối transport");
  }
});

app.listen(port, () => {
  console.log(`Máy chủ MCP GitHub đang mở cổng chạy trực tiếp tại cổng ${port}`);
});

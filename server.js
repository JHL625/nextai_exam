import express from "express";
import cors from "cors"; //允许跨域
import dotenv from "dotenv";
import multer from "multer"; // 允许上传文件
import chat from "./chat.js";

dotenv.config();

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const PORT = process.env.PORT || 8080;

let filePath;

//设计api要考虑什么：
// RESTful-一句话形容这个api做什么的
// GET/POST/DELETE/PATCH
// ststua code
// input paylod? param?
// output

//upload是middleware
app.post("/upload", upload.single("file"), async (req, res) => {
  // Use multer to handle file upload
  filePath = req.file.path; // The path where the file is temporarily saved
  res.send(filePath + " upload successfully.");
});

app.get("/chat", async (req, res) => {
  const resp = await chat(req.query.question, filePath); // Pass the file path to your main function
  res.send(resp.text);
});

app.get("/", (req, res) => {
  res.send("healthy");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

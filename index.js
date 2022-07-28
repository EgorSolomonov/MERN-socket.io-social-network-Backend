// подключение пакетов
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const imageRouter = require("./routes/image");
const postImgRouter = require("./routes/postImgRouter");
const conversationRouter = require("./routes/conversations");
const messageRouter = require("./routes/messages");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");

// Запуск библиотек
const app = express();
const io = new Server(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// socket server data

// add user
let users = [];

const addUser = (userId, socketId) => {
  if (users.length === 0) {
    users.push({ userId, socketId });
  } else if (users.length > 0) {
    users = users.filter((user) => user.userId !== userId);

    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.once("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, messageText }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", { senderId, messageText });
  });

  socket.on(
    "sendNotification",
    ({ conversationId, authorId, receiverId, type }) => {
      const user = getUser(receiverId);
      if (type === "message")
        io.to(user?.socketId).emit("getNotification", {
          conversationId,
          authorId,
          receiverId,
        });
    }
  );

  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// Данные сервера express и БД mongoDB
const port = process.env.PORT || 8080;
const url =
  "mongodb+srv://Egor:tujhtujh3467T@cluster0.fqtx0.mongodb.net/socialNetwork?retryWrites=true&w=majority";

// Подключение сервера express к базе данных mongoDB
mongoose.connect(
  url,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) return console.log(err);
    console.log("База данных подключена...");
  }
);

// middleware
app.use(cors()); // добавление Acces control allow origin *

app.use(morgan("common")); // подключение логгера, выводит инфу о запросе в console.log

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // использование статической директории вместо запроса при использовании данного пути /uploads
app.use("/postUploads", express.static(path.join(__dirname, "postUploads"))); // использование статической директории вместо запроса при использовании данного пути /postUploads
app.use("/api/users", userRouter); // путь к подзаголовку пути -  user
app.use("/api/auth", authRouter); // путь к подзаголовку пути -  auth
app.use("/api/post", postRouter); // путь к подзаголовку пути - post
app.use("/api/upload", imageRouter); // путь к подзаголовку пути - image
app.use("/api/upload", postImgRouter); // путь к подзаголовку пути - post img
app.use("/api/conversation", conversationRouter); // путь к подзаголовку пути - conversation
app.use("/api/message", messageRouter); // путь к подзаголовку пути - message

app.get("/", (req, res) => {
  res.send("Домашняя страница");
});

// Запуск сервера
app.listen(port, () => {
  console.log("Сервер подключен...");
});

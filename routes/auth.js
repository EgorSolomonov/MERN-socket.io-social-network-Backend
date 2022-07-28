const express = require("express");
const mongoose = require("mongoose");
const userScheme = require("../models/User");
const jsonParser = express.json();
const bcrypt = require("bcrypt");

const authRouter = express.Router();

const User = mongoose.model("User", userScheme);

//Регистрация
authRouter.post("/registration", jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  // шифрование пароля
  const bcryptPassword = await bcrypt.hash(req.body.password, 10);

  //создание нового пользователя исходя из его данных
  const newUser = new User({
    name: req.body.username,
    email: req.body.email,
    password: bcryptPassword,
    isAdmin: req.body.isAdmin,
  });

  // сохранение пользователя в базе данных + ответ сервера
  try {
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Логинизация
authRouter.post("/login", jsonParser, async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  try {
    //поиск по email в БД
    const userEmail = await User.findOne({
      email: req.body.email,
    });

    // сравнение пароля с БД
    const userPassword = await bcrypt.compare(
      req.body.password,
      userEmail.password
    );

    //сравнение пароля и email с БД, отказ, либо вход
    !userEmail
      ? res.status(400).json("Пользователь не найден.")
      : !userPassword
      ? res.status(400).json("Неверный пароль.")
      : res.status(200).json(userEmail);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = authRouter;

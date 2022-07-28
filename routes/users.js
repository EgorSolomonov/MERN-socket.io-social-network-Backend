const express = require("express");
const userScheme = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userRouter = express.Router();
const jsonParser = express.json();

const User = mongoose.model("User", userScheme);

// Запрос на изменение данных пользователем PUT

userRouter.put("/:id", jsonParser, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Данные обновлены");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("Можно изменить только данные своего аккаунта!");
  }
});

// Запрос на удаление данных пользователя DELETE

userRouter.delete("/:id", jsonParser, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      res.status(200).json("Пользователь удален");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Можно удалить только свой аккаунт");
  }
});

// Запрос на данные пользователя GET

userRouter.get("/", jsonParser, async (req, res) => {
  const userId = req.query.userId;
  const userName = req.query.userName;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ name: userName });

    //деструктуризация объекта
    const { password, updatedAt, isAdmin, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (err) {
    res.status(500).json("Пользователь не существует");
  }
});

// Запрос на данные всех пользователей GET

userRouter.get("/search/", jsonParser, async (req, res) => {
  const userName = req.query.userName;

  try {
    const users = await User.find({});

    const filtredUsers = users.filter((user) =>
      user.name.toLowerCase().startsWith(userName.toString().toLowerCase())
    );

    res.status(200).json(filtredUsers);
  } catch (err) {
    res.status(500).json("Пользователь не существует");
  }
});

// Запрос на дружбу PUT

userRouter.put("/:id/follow", jsonParser, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const meUser = await User.findById(req.body.userId);
      if (!meUser.followers.includes(req.params.id)) {
        //добавление в свой массив подписок
        const myFollowers = await User.findByIdAndUpdate(req.body.userId, {
          $push: { followers: req.params.id },
        });

        //добавление в чужой массив подписчиков
        const hisFollowings = await User.findByIdAndUpdate(req.params.id, {
          $push: { followings: req.body.userId },
        });
      } else res.status(403).json("Уже в подписчиках");

      res.status(200).json("Запрос на подписку успешно отправлен");
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("Нельзя подписаться на свои обновления");
  }
});

// Запрос на отказ от дружбы PUT

userRouter.put("/:id/unfollow", jsonParser, async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const meUser = await User.findById(req.body.userId);
      if (meUser.followers.includes(req.params.id)) {
        //удаление из своего массива последователя
        const myFollowers = await User.findByIdAndUpdate(req.body.userId, {
          $pull: { followers: req.params.id },
        });

        //добавление в чужой массив подписчиков
        const hisFollowings = await User.findByIdAndUpdate(req.params.id, {
          $pull: { followings: req.body.userId },
        });
      } else res.status(403).json("Нет такого подписчика");

      res.status(200).json("Запрос на отписку успешно отправлен");
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(403).json("Нельзя отписаться от своих обновлений");
  }
});

// Запросы на добавление/удаление в/из списка друзей

userRouter.put("/:id/addfriend", jsonParser, async (req, res) => {
  try {
    const meUser = await User.findById(req.body.userId);
    if (
      meUser.followers.includes(req.params.id) &&
      meUser.followings.includes(req.params.id)
    ) {
      const myFriend = await User.findByIdAndUpdate(req.body.userId, {
        $push: { friends: req.params.id },
      });

      const hisFriend = await User.findByIdAndUpdate(req.params.id, {
        $push: { friends: req.body.userId },
      });
    } else res.status(403).json("Пользователь не подписан на вас");

    res.status(200).json("Пользователь добавлен в друзья");
  } catch (err) {
    res.status(403).json(err);
  }
});

userRouter.put("/:id/deletefriend", jsonParser, async (req, res) => {
  try {
    const meUser = await User.findById(req.body.userId);
    if (
      !meUser.followers.includes(req.params.id) ||
      !meUser.followings.includes(req.params.id)
    ) {
      const myFriend = await User.findByIdAndUpdate(req.body.userId, {
        $pull: { friends: req.params.id },
      });

      const hisFriend = await User.findByIdAndUpdate(req.params.id, {
        $pull: { friends: req.body.userId },
      });
    } else res.status(403).json("Пользователь не подписан на вас");

    res.status(200).json("Пользователь добавлен в друзья");
  } catch (err) {
    res.status(403).json(err);
  }
});

userRouter.get("/", (req, res) => {
  res.send("Страница пользователей");
});

module.exports = userRouter;

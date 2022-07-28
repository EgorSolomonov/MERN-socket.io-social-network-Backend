const express = require("express");
const postScheme = require("../models/Post");
const userScheme = require("../models/User");
const mongoose = require("mongoose");

const postRouter = express.Router();
const jsonParser = express.json();

const User = mongoose.model("User", userScheme);
const Post = mongoose.model("Post", postScheme);

postRouter.get("/", (req, res) => {
  res.send("Страница постов");
});

// Создание

postRouter.post("/", jsonParser, async (req, res) => {
  const newPost = new Post(req.body);
  try {
    await newPost.save();

    res.status(200).json("Пост сохранен");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Изменение поста

postRouter.put("/:id", jsonParser, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });

    res.status(200).json("Данные поста обновлены");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Удаление поста

postRouter.delete("/:id", jsonParser, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    res.status(200).json("Пост удален");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Лайк поста

postRouter.put("/:id/like", jsonParser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.body.userId)) {
      const like = await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.body.userId },
      });

      res.status(200).json("Пост был оценен");
    } else {
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.body.userId },
      });

      res.status(200).json("Оценка поста отменена");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Получение всех своих постов

postRouter.get("/:id", jsonParser, async (req, res) => {
  try {
    const profilePosts = await Post.find({ sendToUserId: req.params.id });

    res.status(200).json(profilePosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Получение истории постов друзей + своих

postRouter.get("/common/posts", jsonParser, async (req, res) => {
  try {
    const meUser = await User.findById(req.body.userId);
    const myPosts = await Post.find({ userId: req.body.userId });

    const myFriendsIds = await Promise.all(
      meUser.followers.map((id) => {
        return Post.find({ userId: id });
      })
    );

    res.status(200).json(myPosts.concat(...myFriendsIds));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = postRouter;

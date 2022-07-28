const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userScheme = new Schema(
  {
    name: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    userPicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    friends: {
      type: Array,
      default: [],
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    birthday: {
      type: String,
      max: 6,
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
    profileStatus: {
      type: String,
      max: 200,
    },
  },
  { timestamps: true }
);

module.exports = userScheme;

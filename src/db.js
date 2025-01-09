const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
require("dotenv").config();

const uri = process.env.MONGO_URI;

let client;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    await client.connect();
  }
  return client.db("MMAdmin");
}

async function findUser(username, password) {
  const db = await connectToDB();
  const users = db.collection("AdminLogin");
  const user = await users.findOne({ username, password });
  return user;
}

async function fetchMembers(location) {
  const db = await connectToDB();
  const members = db.collection(`${location}`);
  const data = await members.find().toArray();
  return data;
}

async function updateMemberStatusInDb(memberId, month, status, location) {
  const db = await connectToDB();
  const members = db.collection(`${location}`);
  const updateQuery = {
    _id: memberId,
  };
  const updateData = {
    $set: {
      [`janaza_2024.${month}`]: status,
    },
  };
  await members.updateOne(updateQuery, updateData);
}

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

const memberSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  telephone: {
    type: String,
  },
});

const Member = mongoose.model("Member", memberSchema);

module.exports = {
  connectToDB,
  findUser,
  User,
  Member,
  fetchMembers,
};

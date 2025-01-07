const { MongoClient } = require("mongodb");
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

module.exports = { connectToDB, findUser };

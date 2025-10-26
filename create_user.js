require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);

async function createUser() {
  try {
    const user = new User({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    await user.save();
    console.log("✅ Authorized user account created!");
  } catch (err) {
    console.error("❌ Error creating user:", err);
  } finally {
    mongoose.disconnect();
  }
}

createUser();

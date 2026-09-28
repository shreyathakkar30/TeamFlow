const mongoose = require("mongoose");
const User = require("./src/models/User");

const createTestUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/teamflow");

    console.log("MongoDB connected");

    // Remove only the test users created by this script
    await User.deleteMany({
      email: /^pagination\d+@teamflow\.test$/,
    });

    const users = [];

    for (let i = 1; i <= 24; i++) {
      users.push({
        name: `Pagination User ${i}`,
        email: `pagination${i}@teamflow.test`,
        password: "Test@1234",
        role: "member",
        isActive: true,
      });
    }

    await User.create(users);

    console.log("24 test users created successfully");

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createTestUsers();
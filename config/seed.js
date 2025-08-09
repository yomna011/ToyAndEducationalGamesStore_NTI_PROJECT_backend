require("dotenv").config();
const connectDB = require("./db");


const User = require("../models/user.model");
const Toy = require("../models/toy.model");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");


const { users, toys, carts, orders } = require("./dummyData.json");

// for inserting all data
const insertData = async () => {
  try {
    await connectDB();
    await User.insertMany(users);
    await Toy.insertMany(toys);
    await Cart.insertMany(carts);
    await Order.insertMany(orders);
    console.log("All data inserted successfully.");
    process.exit();
  } catch (error) {
    console.error(" Failed to insert data:", error.message);
    process.exit(1);
  }
};

// for Deleting all data
const deleteData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Toy.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    console.log("All data deleted successfully.");
    process.exit();
  } catch (error) {
    console.error("Failed to delete data:", error.message);
    process.exit(1);
  }
};

// Command handler
if (process.argv[2] === "--insert") {
  insertData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Unknown command. Use --insert or --delete");
  process.exit();
}

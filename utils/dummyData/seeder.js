const fs = require("fs");
const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies
require("colors");

const dotenv = require("dotenv");
const Product = require("../../models/productModel");
const dbConnection = require("../../config/database");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Connect to DB
console.log("Database URI:", process.env.DB_URI); // Debugging step
dbConnection();

// Read data
const products = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./products.json"), "utf-8")
);

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);
    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Execute based on argument
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}

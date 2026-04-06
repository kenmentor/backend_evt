const {Store} = require("evtstore");
const { collection } = require("../modules/tour");
Store.connect("mongodb://localhost:27017/tours", {
  collection:"tour_events"})
  .then(() => console.log("Connected to MongoDB for TourRepository"))
  .catch((err) => console.error("MongoDB connection error:", err));
  module.exports = new Store;
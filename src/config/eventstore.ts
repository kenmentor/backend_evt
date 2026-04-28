// NOTE: evtstore does not export a `Store` class in its current version.
// This file preserves the original JS logic but will fail at runtime.
// The project uses event-sourcing/ instead for event store functionality.
import evtstore from "evtstore";

const Store = (evtstore as any).Store;

(Store as any)
  .connect("mongodb://localhost:27017/tours", {
    collection: "tour_events",
  })
  .then(() => console.log("Connected to MongoDB for TourRepository"))
  .catch((err: Error) => console.error("MongoDB connection error:", err));

export default new (Store as any)();

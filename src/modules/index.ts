import resourceDB from "./resource";
import userDB from "./user";
import feedbackDB from "./feedback";
import bookingDB from "./booking";
import requestDB from "./request";
import demandDB from "./demand";
import paymentDB from "./payment";
import { Conversation, Message } from "./chat";

export {
  resourceDB,
  userDB,
  feedbackDB,
  bookingDB,
  requestDB,
  demandDB,
  paymentDB,
  Conversation,
  Message,
};

export const chatDB = { Conversation, Message };

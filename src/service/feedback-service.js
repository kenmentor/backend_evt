/**
 * Feedback Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");

function getFeedbackRepo() {
  const { feedbackEventRepo } = getRepos();
  return feedbackEventRepo;
}

async function create_feedback(feedbackObj) {
  const repo = getFeedbackRepo();
  const feedbackId = new mongoose.Types.ObjectId().toString();
  
  await repo.create({
    _id: feedbackId,
    userId: feedbackObj.userId,
    message: feedbackObj.message,
  });
  
  return await repo.findById(feedbackId);
}

async function get_feedback() {
  const repo = getFeedbackRepo();
  return await repo.findAll();
}

module.exports = {
  create_feedback,
  get_feedback,
};

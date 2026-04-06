/**
 * Request Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const { sendRequestEmail } = require("../utility/mail-trap/emails");
const mongoose = require("mongoose");

function getRequestRepo() {
  const { requestEventRepo } = getRepos();
  return requestEventRepo;
}

async function create_request(object) {
  const repo = getRequestRepo();
  const requestId = new mongoose.Types.ObjectId().toString();
  
  const data = await repo.create({
    _id: requestId,
    host: object.hostId,
    guest: object.guestId,
    house: object.houseId,
  });
  
  // Send email notification (if email is available)
  // Note: In event sourcing, we may need to fetch user data separately
  // sendRequestEmail(data.email, data.hostId, data.guest);
  
  return data;
}

async function delete_request(id) {
  const repo = getRequestRepo();
  // Soft delete
  await repo.commands.delete(id);
  await repo.handler.runOnce();
  return { deleted: true };
}

async function get_all_request(userId, role) {
  const repo = getRequestRepo();
  
  let filter = {};
  if (role === "guest") {
    filter = { guest: userId };
  } else if (role === "host") {
    filter = { host: userId };
  }
  
  return await repo.find(filter);
}

async function get_request_details(id) {
  const repo = getRequestRepo();
  return await repo.findById(id);
}

async function alreadyExit(object) {
  const repo = getRequestRepo();
  return await repo.findOne(object);
}

async function update_request(id, object) {
  const repo = getRequestRepo();
  
  if (object.accepted !== undefined) {
    if (object.accepted) {
      await repo.commands.accept(id);
    } else {
      await repo.commands.reject(id);
    }
    await repo.handler.runOnce();
  }
  
  return await repo.findById(id);
}

module.exports = {
  create_request,
  delete_request,
  get_all_request,
  get_request_details,
  update_request,
  alreadyExit,
};

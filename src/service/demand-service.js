/**
 * Demand Service - Event Sourcing Version
 */

const { getRepos } = require("../event-sourcing");
const mongoose = require("mongoose");

function getDemandRepo() {
  const { demandEventRepo } = getRepos();
  return demandEventRepo;
}

async function find_demand(object) {
  const repo = getDemandRepo();
  return await repo.findAll();
}

async function update_demand(object) {
  const repo = getDemandRepo();
  // Handle update if needed
  return await repo.findById(object.id);
}

async function get_details(id) {
  const repo = getDemandRepo();
  return await repo.findById(id);
}

async function update_demand_view(id) {
  // Demand doesn't have view tracking in event sourcing
  return { views: 0 };
}

async function upload_demand(body) {
  const repo = getDemandRepo();
  const demandId = new mongoose.Types.ObjectId().toString();
  
  await repo.create({
    _id: demandId,
    guest: body.guest,
    description: body.description,
    state: body.state,
    price: Number(body.price),
    type: body.type,
    category: body.category,
  });
  
  return await repo.findById(demandId);
}

module.exports = {
  find_demand,
  update_demand_view,
  upload_demand,
  get_details,
  update_demand,
};

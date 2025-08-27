const { resourceDB } = require("../modules");
const { crudRepository } = require("../repositories");

require("dotenv").config();

const newcrudRepositoryExtra = new crudRepository(resourceDB);

async function find_demand(object) {
  await connectDB();
  return newcrudRepositoryExtra.filter(object);
}

async function update_demand(object) {
  return newnewcrudRepositoryExtra.update(object);
}

async function get_details(id) {
  return newcrudRepositoryExtra.getDetail(id);
}

async function update_demand_view(id) {
  try {
    const data = await newcrudRepositoryExtra.update(
      id,
      { $inc: { view: 1 } },
      { new: true }
    );
    return { views: data };
  } catch (err) {
    console.error("Error while updating demand view:", err);
    throw err;
  }
}

async function upload_demand(body) {
  body.price = Number(body.price);
  body.waterSuply = Boolean(body.waterSuply);
  const data = await newcrudRepositoryExtra.create(body);
  await data.save();
  return data;
}

module.exports = {
  find_demand,
  update_demand_view,
  upload_demand,
  get_details,
  update_demand,
};

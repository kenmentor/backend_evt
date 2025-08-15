const { request_repo } = require("../repositories");
const { requestDB } = require("../modules");

const Request_repo = new request_repo(requestDB);

async function create_request(object) {
  const hostId = object.hostId;
  const guestId = object.guestId;
  const houseId = object.houseId;
  try {
    const data = await Request_repo.create({
      host: hostId,
      guest: guestId,
      house: houseId,
    });
    return data;
  } catch (erro) {
    console.error(erro);
  }
}

function delete_request(id) {
  return Request_repo.delete(id);
}
function get_all_request(userId,role) {
  try {
    if(role == "guest"){
        return Request_repo.find({ guest: Object(userId) });
    }
    if(role == "geust"){
        return Request_repo.find({ guest: Object(userId) });
    }
    if(role == "host"){
       return Request_repo.find({ host: Object(userId) });
    }
    return ["hello"]
   
  } catch (error) {
    throw error
  }

}

function get_request_details(id) {
  try{
  return Request_repo.findById(id);
  }catch(error){
    console.log(error)
    return null
  }
}
async function alreadyExit(object){
  console.log(object , "this is th object" )
 try{
  return Request_repo.findOne(object)
  }catch(error){
    console.log(error)
    return null
  }

}
async function update_request(id, object) {
  data = await Request_repo.update(Object(id), object)
}


module.exports = {
  create_request: create_request,
  delete_request: delete_request,
  get_all_request: get_all_request,
  get_request_details: get_request_details,
  update_request: update_request,
  alreadyExit
};

// const Tour = require("../modules/tour");

// class TourRepository {
//   async create(tourData) {
//     const tour = new Tour(tourData);
//     return await tour.save();
//   }

//   async findById(id) {
//     return await Tour.findById(id);
//   }

//   async findByGuestId(guestId) {
//     return await Tour.find({ guestId }).sort({ createdAt: -1 });
//   }

//   async findByHostId(hostId) {
//     return await Tour.find({ hostId }).sort({ createdAt: -1 });
//   }

//   async findByAgentId(agentId) {
//     return await Tour.find({ agentId }).sort({ createdAt: -1 });
//   }

//   async findByPropertyId(propertyId) {
//     return await Tour.find({ propertyId }).sort({ createdAt: -1 });
//   }

//   async updateStatus(id, status) {
//     return await Tour.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );
//   }

//   async update(id, updateData) {
//     return await Tour.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     );
//   }

//   async delete(id) {
//     return await Tour.findByIdAndDelete(id);
//   }
// }

// module.exports = new TourRepository();
const {Store} = require("evtstore");
const Touur = require("../modules/tour");

class TourRepository {
  async create(tourData) {
const tourId = tourData._id || new mongoose.Types.ObjectId();
const tourPayload = {
  ...tourData,
  _id: tourId,
};
const stream = Store.stream(`tour-${tourId}`);
await stream.addEvent({type: "TourScheduled", payload: tourPayload});
await stream.commit();
const tour = new Tour(tourPayload);
return await  tour.save();
  }

  async updateStatus(id, status) {
    const stream = Store.stream(`tour-${id}`);
    await stream.addEvent({type: "TourStatusUpdated", payload: {status}});
    await stream.commit();
    return await Tour.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
  async findByIdAndUpdate(guestId, updateData) {
    const stream = Store.stream(`tour-${guestId}`);
    await stream.addEvent({type: "TourUpdated", payload: updateData});
    await stream.commit();
    return await Tour.findByIdAndUpdate(
      guestId,
      updateData,
      { new: true }
    );
  }

  async findById(id) {
    return await Tour.findById(id);
  }

  async findByGuestId(guestId) {
    return await Tour.find({ guestId }).sort({ createdAt: -1 });
  }

  async findByHostId(hostId) {
    return await Tour.find({ hostId }).sort({ createdAt: -1 });
  }

  async findByAgentId(agentId) {
    return await Tour.find({ agentId }).sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId) {
    return await Tour.find({ propertyId }).sort({ createdAt: -1 });
  }
  
  async delete(id) {
    const stream = Store.stream(`tour-${id}`);
    await stream.addEvent({type: "TourDeleted", payload: {id}});
    await stream.commit();
    return await Tour.findByIdAndDelete(id);
  }
}
async function sysFromEventStore(tourId) {
  const stream = Store.stream(`tour-${tourId}`);
  const events = await stream.getEvents();
  let tourState = {};
  events.forEach(event => {
    switch (event.type) {
      case "TourScheduled":
        tourState = {...event.payload};
        break;
      case "TourStatusUpdated":
        tourState.status = event.payload.status;
        break;
      case "TourUpdated":
        tourState = {...tourState, ...event.payload};
        break;
      case "TourDeleted":
        tourState = null;
        break;
    }
  }
)
if (!tourState) {
  return await Tour.findByIdAndDelete(tourId);
  
}
return await Tour.findByIdAndUpdate(tourId, tourState, {new: true});
  }



module.exports = new TourRepository();
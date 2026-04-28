const { getRepos } = require("../event-sourcing");

class user_repo {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      const { userEventRepo } = getRepos();
      this._repo = userEventRepo;
    }
    return this._repo;
  }

  async find(query) {
    return this.repo.find(query);
  }

  async findOne(query) {
    return this.repo.findOne(query);
  }

  async findById(id) {
    return this.repo.findById(id);
  }

  async create(data) {
    const userId = data._id || new (require("mongoose").Types.ObjectId)().toString();
    await this.repo.create({ _id: userId, ...data });
    return this.repo.findById(userId);
  }

  async filter(filter) {
    try {
      let query = {};

      if (filter.location && filter.location !== "undefined") {
        const allUsers = await this.repo.findAll();
        query = allUsers.filter(u => 
          u.location && u.location.toLowerCase().includes(filter.location.toLowerCase())
        );
        return query;
      }

      if (filter.type && filter.type !== "undefined") {
        query.type = filter.type;
      }

      if (filter.role && filter.role !== "undefined") {
        query.role = filter.role;
      }

      if (filter.adminVerified) {
        query.adminVerified = true;
      }

      const limit = Number(filter.limit) || 50;
      const page = Number(filter.bardge) || 1;
      const skip = (page - 1) * limit;

      const results = await this.repo.find(filter);
      return results.slice(skip, skip + limit);
    } catch (error) {
      console.error("Error filtering data:", error);
      throw error;
    }
  }
}

module.exports = user_repo;

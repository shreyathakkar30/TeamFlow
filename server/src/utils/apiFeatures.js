// Applies filtering, text search, sorting, and pagination to a Mongoose
// query based on Express req.query parameters.
class ApiFeatures {
  constructor(query, mongooseQuery, reqQuery) {
    this.query = query; // base mongoose query object (filters accumulate here)
    this.mongooseQuery = mongooseQuery; // Model.find()
    this.reqQuery = reqQuery;
  }

  filter(allowedFields) {
    allowedFields.forEach((field) => {
      if (this.reqQuery[field] !== undefined && this.reqQuery[field] !== '') {
        this.query[field] = this.reqQuery[field];
      }
  });
    return this;
  }

  dateRange(field, fromKey, toKey) {
    if (this.reqQuery[fromKey] || this.reqQuery[toKey]) {
      this.query[field] = {};
      if (this.reqQuery[fromKey]) this.query[field].$gte = new Date(this.reqQuery[fromKey]);
      if (this.reqQuery[toKey]) this.query[field].$lte = new Date(this.reqQuery[toKey]);
    }
    return this;
  }

  search(searchableFields) {
    if (this.reqQuery.search) {
      const regex = new RegExp(this.reqQuery.search.trim(), 'i');
      this.query.$or = searchableFields.map((field) => ({ [field]: regex }));
    }
    return this;
  }

  async paginate(Model, defaultSort = '-createdAt') {
    const page = Math.max(parseInt(this.reqQuery.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.reqQuery.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = this.reqQuery.sortBy || defaultSort;

    const total = await Model.countDocuments(this.query);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      page,
      limit,
      skip,
      sortBy,
      total,
      totalPages,
    };
  }
}

module.exports = ApiFeatures;

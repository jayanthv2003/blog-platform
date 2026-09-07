// Builds a Mongoose query from req.query for search, filtering, sorting & pagination.
// Shared between the public post feed and the admin post list.
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(fields = ['title', 'subtitle', 'tags']) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, 'i');
      this.query = this.query.find({ $or: fields.map((f) => ({ [f]: regex })) });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['search', 'sort', 'page', 'limit', 'author'];
    excluded.forEach((field) => delete queryObj[field]);

    if (queryObj.category) {
      this.query = this.query.find({ category: queryObj.category });
      delete queryObj.category;
    }
    if (queryObj.tag) {
      this.query = this.query.find({ tags: queryObj.tag.toLowerCase() });
      delete queryObj.tag;
    }
    if (queryObj.status) {
      this.query = this.query.find({ status: queryObj.status });
      delete queryObj.status;
    }

    return this;
  }

  authorSearch() {
    // author search matches against a pre-resolved list of user ids (set by controller)
    if (this.queryString._authorIds) {
      this.query = this.query.find({ author: { $in: this.queryString._authorIds } });
    }
    return this;
  }

  sort() {
    const sortMap = {
      latest: '-createdAt',
      oldest: 'createdAt',
      mostViewed: '-views',
      mostLiked: '-likeCount',
      title: 'title',
    };

    this.query = this.query.sort(sortMap[this.queryString.sort] || '-createdAt');
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;

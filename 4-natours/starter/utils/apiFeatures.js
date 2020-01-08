class APIFeatures {
  // pass in the mongoose query and the query string we get from express (route)
  // we are passing the query here because we do not want to query inside of this class because that will then bind the class to the tour resource
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1a) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // remove all these from our query object by looping
    // from the queryObj we want to remove the field (current element in array) with the name query element
    excludedFields.forEach(el => delete queryObj[el]);

    // 1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // we want to replace lt, lte, gt, gte using regex
    queryStr = queryStr.replace(/\b[gl]te?\b/g, match => `$${match}`);

    // investigate why ^..$ is not working..
    // queryStr = queryStr.replace(/^[gl]te?$/g, match => `$${match}`);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // simply the query without any await
    // change fron const to a regular variable, find() will return a query we will keep chaining more methods to it available on all documents created thru the query class

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));

    return this; // return the entire object to allow chaining, the object has access to other methods
  }

  sort() {
    if (this.queryString.sort) {
      // const sortBy = req.query.sort.replace(/,/g, ' ');
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // say price
    } else {
      // add a default sort order, newest appear first
      this.query = this.query.sort('-createdAt');
    }

    return this; // return the entire object to allow chaining, the object has access to other methods
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // - is excluding
    }

    return this; // return the entire object to allow chaining, the object has access to other methods
  }

  paginate() {
    // page=2&limit=10
    // get the page and the limit from the query string and also define some default values
    const page = this.queryString.page * 1 || 1; // String to # & default value
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Don't throw an error for skip > number of results

    return this; // return the entire object to allow chaining, the object has access to other methods
  }
}

module.exports = APIFeatures;

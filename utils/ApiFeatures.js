const mongoose = require('mongoose');

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }
    //Filtering Logic
    filter() {
        const queryObj = { ...this.queryString }
        const avoid = ['page', 'sort', 'limit', 'fields']
        avoid.forEach(avoidEL => delete queryObj[avoidEL]);

        //Advance Filtering with $ operators
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    //Sorting Logic
    sort() {
        if (this.queryString.sort) {
            const SortOBJ = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(SortOBJ)
        } else {
            this.query.sort("-createdAt")
        }
        return this;
    }
    //Field limiting Logic
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // Exclude Mongoose's internal __v field by default
        }
        return this;
    }
    //Pagination Logic
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;













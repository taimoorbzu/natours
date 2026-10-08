const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/TourModel.js');
const User = require('../models/userModel.js');
const Review = require('../models/ReviewModel.js');

dotenv.config({ path: `${__dirname}/../.env` });

// Read JSON files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8'));

const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful');

    // Check CLI arguments to determine action
    if (process.argv[2] === '--import') {
        importData();
    } else if (process.argv[2] === '--delete') {
        deleteData();
    } else {
        console.log('Please specify --import or --delete');
        process.exit();
    }
}).catch(error => {
    console.error(`DB connection error: ${error}`);
    process.exit(1);
});

// Import all Data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.error('Error importing data:', err);
    }
    process.exit();
};

// Delete all Data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.error('Error deleting data:', err);
    }
    process.exit();
};


const fs = require('fs');
const Tour = require('../models/TourModel.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: `${__dirname}/../.env` });

const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));

const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => {
    console.log('DB connection successful');

    // Check CLI arguments to determine action
    if (process.argv[2] === '--import') {
        importTours();
    } else if (process.argv[2] === '--delete') {
        deleteTours();
    } else {
        // Default to import if run without flags
        importTours();
    }
}).catch(error => {
    console.error(`DB connection error: ${error}`);
    process.exit(1);
});

// Import Data into DB (clears collection first)
const importTours = async () => {
    try {
        await Tour.deleteMany();
        console.log('Existing tours deleted successfully!');

        await Tour.create(toursData);
        console.log('Tours imported successfully!');
    } catch (err) {
        console.error('Error importing tours:', err);
    }
    process.exit();
};

// Delete all Data from DB
const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        console.log('Tours deleted successfully!');
    } catch (err) {
        console.error('Error deleting tours:', err);
    }
    process.exit();
};

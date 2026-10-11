const express = require('express');
const { getOverview, getTour } = require('../controllers/viewsController.js');

const router = express.Router();

router.get('/', getOverview);
router.get('/tour', getTour);

module.exports = router;
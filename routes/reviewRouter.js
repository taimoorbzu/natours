const express = require("express");
const router = express.Router({ mergeParams: true });
const { protectMiddleWare, CheckUserrRole } = require('../controllers/authController');
const { getAllReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

router.route('/')
    .get(getAllReviews)
    .post(protectMiddleWare, CheckUserrRole('user'), createReview)

router.route('/:id')
    .patch(protectMiddleWare, CheckUserrRole('user', 'admin'), updateReview)
    .delete(protectMiddleWare, CheckUserrRole('user', 'admin'), deleteReview)

module.exports = router;

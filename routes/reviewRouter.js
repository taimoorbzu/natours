const router = express.Router();
const { protectMiddleWare, CheckUserrRole } = require('../controllers/authController');
const { getAllReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');

router.route('/')
    .get(getAllReviews)
    .post(protectMiddleWare, CheckUserrRole('user'), createReview)

router.route('/:id')
    .patch(updateReview)
    .delete(deleteReview)

module.exports = router;

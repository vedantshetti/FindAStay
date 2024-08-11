const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const reviewsController = require("../controllers/reviews");

// Create a review route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

// Delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview));

module.exports = router;

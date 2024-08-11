const mongoose = require("mongoose");
const Listing = require("./models/listing"); // Correct path for middleware.js
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

// Middleware to validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
// Check if User is Logged In
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// Save Redirect URL
const saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // Clear the redirectUrl from the session after using it
  }
  next();
};

// Check if User is Owner
const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate('owner');

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  if (!listing.owner || !listing.owner._id.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};




const validateListing = (req, res, next) => {
  if (!req.body.listing.image || !req.body.listing.image.url) {
    req.body.listing.image = { url: defaultImageUrl, filename: '' };
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    return next(new ExpressError(msg, 400)); // Use return to prevent further execution
  }
  next();
};

// Middleware to check if the user is the owner of the review
const isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    req.flash("error", "You do not have access to perform this action!");
    return res.redirect("back");
  }

  const review = await Review.findById(reviewId).populate('author');

  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect("back");
  }

  if (!review.author || !review.author._id.equals(req.user._id)) {
    req.flash('error', 'You do not have access to perform this action!');
    return res.redirect(`/listings/${req.params.id}`);
  }

  next();
};



module.exports = {
  // validateListing,
  validateReview,
  isLoggedIn,
  saveRedirectUrl,
  isOwner,isReviewAuthor
};

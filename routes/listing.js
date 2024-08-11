const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const mongoose = require("mongoose");
const { isLoggedIn, isOwner } = require("../middleware");
const listings = require("../controllers/listings");
const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const defaultImageUrl = 'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHViYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60';

const validateListing = (req, res, next) => {
  if (!req.body.listing.image || !req.body.listing.image.url) {
    req.body.listing.image = { url: defaultImageUrl, filename: '' };
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  next();
};

router
  .route("/")
  .get(wrapAsync(listings.index)) // Ensure the index function is correctly handled
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listings.createListing)
  );

router.get("/new", isLoggedIn, listings.renderNewForm);
router.get("/search", wrapAsync(listings.searchListing)); // Ensure search works correctly

router
  .route("/:id")
  .get(wrapAsync(listings.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listings.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listings.deleteListing));

router.get("/:id/edit", isLoggedIn, isOwner, listings.renderEditForm);
router.get("/category/:category", wrapAsync(listings.searchCategory));

module.exports = router;

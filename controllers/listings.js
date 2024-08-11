const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN; 
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const defaultImageUrl = 'https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHViYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60';

module.exports.index = wrapAsync(async (req, res) => {
  const allListings = await Listing.find({}).populate('owner');
  res.render("listings/index", { allListings });
});

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  }).populate('owner');

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  console.log('Listing geometry:', listing.geometry); // Log geometry to ensure it exists

  return res.render("listings/show", { listing, mapToken, geometry: listing.geometry });
});

module.exports.createListing = wrapAsync(async (req, res, next) => {
  try {
      console.log('Starting to create a new listing...');

      let response = await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1
      }).send();

      console.log('Geocoding response:', response.body);

      // Set default image URL if no file is uploaded
      let url = req.file ? req.file.path : defaultImageUrl;
      let filename = req.file ? req.file.filename : '';

      // Check if geometry is available
      const geometry = response.body.features[0]?.geometry;
      if (!geometry) {
          throw new ExpressError('Unable to find location geometry', 400);
      }

      // Create a new listing object
      const newListing = new Listing({
          ...req.body.listing,
          owner: req.user._id,
          image: { url, filename },
          geometry // Assign geometry from geocoding response
      });

      let savedListing = await newListing.save();
      console.log(savedListing);

      console.log('Listing saved, sending response...');
      req.flash("success", "New listing created");
      res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
      console.error('Error in createListing:', err);
      next(err);
  }
});

module.exports.renderEditForm = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
});

module.exports.updateListing = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  try {
    console.log('Starting to update the listing...');

    let url = req.file ? req.file.path : req.body.listing.image.url || defaultImageUrl;
    let filename = req.file ? req.file.filename : req.body.listing.image.filename || '';

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    console.log('Geocoding response:', response.body);

    const geometry = response.body.features[0]?.geometry;
    if (!geometry) {
        throw new ExpressError('Unable to find location geometry', 400);
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
      image: { url, filename },
      geometry // Update the geometry from geocoding response
    }, { new: true }); // Ensure the updated document is returned

    console.log('Listing updated, sending response...');
    req.flash("success", "Listing updated successfully");
    return res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    console.error('Error in updateListing:', err);
    next(err);
  }
});

module.exports.deleteListing = wrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid listing ID.");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
});

module.exports.searchListing = wrapAsync(async (req, res) => {
  const { country } = req.query;
  try {
    let query = {};
    if (country) {
      query.country = { $regex: country, $options: 'i' }; // case-insensitive search
    }
    const allListings = await Listing.find(query);
    res.render('listings/search', { allListings, country }); // Pass country to the view
  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong while searching.');
    res.redirect('/');
  }
});

module.exports.searchCategory = wrapAsync(async (req, res) => {
  const { category } = req.params;
  try {
      const allListings = await Listing.find({ category: category });
      res.render('listings/category.ejs', { allListings, category });
  } catch (error) {
      console.error(error);
      req.flash('error', 'Something went wrong while fetching the category.');
      res.redirect('/');
  }
});

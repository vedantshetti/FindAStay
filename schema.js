const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    category: Joi.string().valid(
      'Trending',
      'Rooms',
      'Cities',
      'Mountains',
      'Castles',
      'Amazing Pools',
      'Camping',
      'Arctic',
      'Farm'
    ).required(), // Adding the category field
    image: Joi.object({
      url: Joi.string().required(),
      filename: Joi.string().optional().allow('')
    }).required()
  }).required()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5)
  }).required()
});

module.exports = { listingSchema, reviewSchema };

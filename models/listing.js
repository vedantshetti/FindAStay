const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
    },
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: [
      'Trending',
      'Rooms',
      'Cities',
      'Mountains',
      'Castles',
      'Amazing Pools',
      'Camping',
      'Arctic',
      'Farm'
    ],
    required:true,
  },
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], // 'Point' is the only type allowed for geometry
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
      required: true,
    }
  },
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

//post middleware for handling deletion of listing
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
     await Review.deleteMany({_id:{$in: listing.reviews}});
  }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

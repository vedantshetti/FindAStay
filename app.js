const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
require('dotenv').config();

// Route Files
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");


const  dbURL = process.env.ATLASDB_URL;

main()
  .then(() =>{
    console.log("connected to DB")
  })
   .catch((err) =>{
    console.log(err);
   });



async function main() {
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbURL);
}



// Set up EJS and Views Directory
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));




const store= MongoStore.create({
  mongoUrl: dbURL,
  crypto:{
    secret:process.env.SECRET,
    touchAfter:24*3600,

  }
})



store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err)
})


// Session and Flash Configuration
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};









app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});

// Favicon Handling
// app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.get("/", (req, res) => {
  res.redirect('/listings');  // Render a homepage template
});

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// Catch-all Route for 404 Errors
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));  // Create a new error with status code 404
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;

  res.status(statusCode).render('error', { message });
});

// Server Listener
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

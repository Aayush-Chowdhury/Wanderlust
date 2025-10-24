const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controller/listings.js"); 
const multer = require('multer');
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage });


router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('image'),
    wrapAsync(listingController.createListing)
  );

// New listing form
router.get("/newpost", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.put( isLoggedIn, isOwner, upload.single('image'), wrapAsync(listingController.updateListing))
.get( wrapAsync(listingController.showListing))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;

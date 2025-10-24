const express = require("express");
const router  = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const listing  = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");
const reviewController = require("../controller/review.js");

router.post("/",isLoggedIn,reviewController.createReview);



module.exports = router;
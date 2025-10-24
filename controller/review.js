const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;

    // Make sure user is logged in
    if (!req.user) {
        req.flash("error", "You must be signed in to leave a review");
        return res.redirect("/login");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Create review and assign author
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    // Save review first
    await newReview.save();

    // Push review ID into listing
    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "Review created!");
    res.redirect(`/listings/${listing._id}`);
};

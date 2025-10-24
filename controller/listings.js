const Listing = require("../models/listing")
const { listingSchema, reviewSchema } = require("../schema.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id).populate({path: "reviews", populate: {path:"author"}}).populate("owner");
  if (!list) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { list });
};
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  }
  const newlist = new Listing(req.body.listing);
  newlist.owner = req.user._id;
  newlist.image = {url,filename};
  await newlist.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id);
  if (!list) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let originalImageUrl = list.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { list, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send Valid data for listing");
  }
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file!== "undefined") {
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url,filename};
  await listing.save();
  }
  req.flash("success", "Listing updated");
  res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
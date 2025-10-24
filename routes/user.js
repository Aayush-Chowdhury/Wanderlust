const express = require("express");
const router  = express.Router();
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirectUrl }  = require("../middleware.js");
const userController = require("../controller/users.js");

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.loginForm)
.post(saveredirectUrl,passport.authenticate("local",{failureRedirect: "/login", failureFlash: true}) , userController.login);

router.get("/logout", userController.logout);

module.exports = router;
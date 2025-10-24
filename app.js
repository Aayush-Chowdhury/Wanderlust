if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express  = require("express");
const mongoose = require("mongoose");
const listing  = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const joi = require('joi');
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/users.js");
const dbUrl = process.env.ATLASDB_URL;






const app = express();  

const listingsRouter  = require("./routes/listing.js");
const reviewsRouter  = require("./routes/review.js");
const userRouter = require("./routes/user.js")


main().then(() =>{
     console.log("Connected to DB");
})
.catch(err =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in mongo session store",err);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxage: 7*24*60*60*1000,
        httpOnly: true,
    },
};




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// app.get("/registerUser", async (req,res) => {
//     let fakeuser = new user({
//         email:"samarjeetkumar1045@gmail.com",
//         username: "Samarjeet",
//     });   
//     let newUser = await user.register(fakeuser, "Aspirin");
//     res.send(newUser);
// })


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curruser = req.user;
    next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);




// app.get("/testListing",async(req,res)=>{
//     let sampleListing  = new listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save().then(()=>{
//         console.log("Sample was saved succesfully");
//         res.send("Successful test");
//     });
// });

// app.get("/",(req,res)=>{
//     res.send("Root Working");
// });

app.all(/.*/, (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err,req,res,next) => {
    let { statusCode, message }  = err;
    res.render("error.ejs",{ message });
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
   console.log("Listening on port 8080");
});
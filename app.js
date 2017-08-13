var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

//mongoose.Promise = require('bluebird');
    
// PASSPORT CONFIG

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.User;
    next();
});

mongoose.connect("mongodb://localhost/yelp_camp");
//mongoose.connect("mongodb://trisha:chiddy@ds143241.mlab.com:43241/yelpcamptsaar");
//mongodb://<dbuser>:<dbpassword>@ds143241.mlab.com:43241/yelpcamptsaar
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use (express.static(__dirname + "/public"));
console.log(__dirname);

seedDB();
//Can do Campground.create({*pass in the object in here!!!*} refer to cats app)

// Campground.create( 
//     {
//         name: "Granite Hill", 
//         image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg/220px-Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg",
//         description: "This is a huge granite hill, no bathrooms or water, but it sure is PURTY."
//     }, 
//     function(err,campground){
//         if(err){
//             console.log(err);
//         } else {
//             console.log("NEWLY CREATED CAMPGROUND: ");
//             console.log(campground);
//         }
//     });

// var campgrounds = [
//         {name: "Salmon Creek", image: "https://farm9.staticflickr.com/8442/7962474612_bf2baf67c0.jpg"},
//         {name: "Granite Hill", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg/220px-Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg"},
//         {name: "Mountain Goat's", image: "http://www.readersdigest.ca/wp-content/uploads/2016/05/7-reasons-why-you-should-go-camping-this-summer.jpg"},
//         {name: "Salmon Creek", image: "https://farm9.staticflickr.com/8442/7962474612_bf2baf67c0.jpg"},
//         {name: "Granite Hill", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg/220px-Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg"},
//         {name: "Mountain Goat's", image: "http://www.readersdigest.ca/wp-content/uploads/2016/05/7-reasons-why-you-should-go-camping-this-summer.jpg"},
//         {name: "Salmon Creek", image: "https://farm9.staticflickr.com/8442/7962474612_bf2baf67c0.jpg"},
//         {name: "Granite Hill", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg/220px-Camping_by_Barriere_Lake%2C_British_Columbia_-_20040801.jpg"},
//         {name: "Mountain Goat's", image: "http://www.readersdigest.ca/wp-content/uploads/2016/05/7-reasons-why-you-should-go-camping-this-summer.jpg"}
//     ]

app.get("/", function(req,res){
    res.render("landing");
})

//INDEX - show all campgrounds
app.get("/campgrounds", function(req,res){
    //Get all campgrounds from DB
    Campground.find({}, function(err,allcampgrounds){
        if(err){
            console.log(err);
        } else {
           res.render("campgrounds/index", {campgrounds:allcampgrounds});// name: data we are passing in. 
        }
    })
})

app.post("/campgrounds", function(req,res){ //restful convention
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description:desc}
    //campgrounds.push(newCampground); n--> don't need this anymore, need to creat a new campground and save to DB
    Campground.create(newCampground,function(err,newlyCreated){
        if (err){
            console.log(err)
        } else {
           //redirect back to campgrounds page
           res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
})

//Shows more info about one campground
app.get("/campgrounds/:id", function(req,res){ //declare this route last because it will pick up on anything campground/
    //find campground with provided ID 
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if (err){
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
})

// ====================
// Comments Routes
// ====================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    //find campground by id 
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    })
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
    //lookup campgrounds using ID
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
          Comment.create(req.body.comment, function(err,comment){
              if (err){
                  console.log(err);
              } else {
                  campground.comments.push(comment);
                  campground.save();
                  res.redirect("/campgrounds/" + campground._id);
              }
          }) 
        }
    })
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});

//AUTHENTICATION ROUTES

//show register form
app.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds");
        });
    })
})

//show login information 
app.get("/login", function(req,res){
    res.render("login");
});
//handling log in logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds", 
        failureRedirect: "/login"
    }), function (req,res){
});

//Logout Route
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has begun.");
});
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
        {name: "Cloud's Rest", image: "http://cdn.exploroz.com/images/Places/80883_0__TN1200.jpg", description: "This place is great!!!"},
        {name: "Laky Lake", image: "http://www.weekendnotes.com/im/006/06/brunt-island-cloud-corner-tasmania-camping-blue-sk1.JPG", description: "Beauttttttiful"},
        {name: "Sturgeon Woods", image: "http://sturgeonwoods.com/wp-content/uploads/2014/02/point-pelee.jpg", description: "Great View!"}
    ];

function seedDB(){
   //Remove all campgrounds
   Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds!");
         //add a few campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err)
                } else {
                    console.log("added a campground");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;

    

// function seedDB(){
//     //Remove all campgrounds
//     Campground.remove({}, function(err){
//         if (err){
//             console.log(err);
//         } else{
//                 console.log("Removed Campgrounds");
//                  //Add campgrounds
//             data.forEach(function(seed){
//             Campground.create(seed, function(err,campground){
//                 if (err){
//                     console.log(err);
//                 } else {
//                     console.log("Added a campground!!!");
//                     Comment.create({text: "This place is great but I wish there was internet", author: "Homer"}, function (err, comment){
//                         if (err){
//                             console.log(err);
//                         } else {
//                             campground.comments.push(comment);
//                             campground.save();
//                             console.log("Created new comment");
//                         }
//                     })
//                 }
//             })
//     });
//     Campground.create({})
//         }
//     });
   
// }

// module.exports = seedDB;
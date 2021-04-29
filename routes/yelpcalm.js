var  express=require("express"),
     router=express(),
     bodyparser=require("body-parser"),
     mongoose=require("mongoose"),
     passport = require("passport"),
     loaclstrategy=require("passport-local"),
     passportlocalmongoose=require("passport-local-mongoose"),
     methodoverride=require("method-override");
  
    
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var User=require("../models/user");
const { authorize } = require("passport");
var router=express.Router();
     

router.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});
router.use(methodoverride("_method"));

//----------------- Campground Routes--------------------

router.get("/",function(req,res){
    res.render("landing");
});

router.get("/campgrounds",isloggedin,(req,res)=>{
    Campground.find({},function(err,allcampground){
        if(err){
            console.log(err);
        }
        else{
            res.render("campground/index",{campground:allcampground,currentUser:req.user});
        }
    });

  
});
router.post("/campgrounds",isloggedin,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var descp=req.body.description;
    var showimg=[req.body.show1,req.body.show2,req.body.show3];
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newcamp={name:name,image:image,description:descp,show:showimg,author:author};
    Campground.create(newcamp,function(err,data){
        if (err){
            console.log(err);
        }
        else{
            console.log(data);
        }
    })
    res.redirect("/campgrounds");
});
router.get("/campgrounds/new",(req,res)=>{
    res.render("campground/new");

});
// show route
router.get("/campgrounds/:id",isloggedin,(req,res)=>{
    // found the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
        if(err){
            console.log(err);
        }
        else{
            // render the show template with campground
          
            res.render("campground/show",{campground:foundcampground});
        }
    });
    
});

// edit route
router.get("/campgrounds/:id/edit",isloggedin,(req,res)=>{
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
           return  res.redirect("/");
        }
        else{
            if(foundcampground.author.id.equals(req.user._id)){
            res.render("campground/edit",{campground:foundcampground});
            }
            else{
                res.send("Sorry! you dont have permission to do so.This post can only be updated by the author of this.");
            }
        }
    });
   
});
// update route
router.put("/campgrounds/:id",isloggedin,(req,res)=>{
    var name=req.body.name;
    var image=req.body.image;
    var descp=req.body.description;
    var arr=[req.body.show0,req.body.show1,req.body.show2];
    var obj={name:name,image:image,description:descp,show:arr};
    Campground.findByIdAndUpdate(req.params.id,obj,function(err,updateddata){
        if(err){
            console.log(err);
            return res.redirect("/");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

// delete route
router.delete("/campgrounds/:id",isloggedin,function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            console.log(err);
           return  res.redirect("/");
        }
        else{
            if(foundcampground.author.id.equals(req.user._id)){
                Campground.findByIdAndRemove(req.params.id,function(err){
                    if(err){
                        res.redirect("/");
                    }
                    else{
                        res.redirect("/campgrounds");
                    }
                });
            }
            else{
                res.send("Sorry! you dont have permission to do so.This post can only be updated by the author of this.");
            }
        }
    });
   
});

// ==========================================
// ==========================================
// comments routes
router.get("/campgrounds/:id/comments/new",isloggedin,(req,res)=>{
    Campground.findById(req.params.id,(err,campground)=>{
        if(err){
            res.send("the error is"+err);
        }
        else{
            res.render("comment/new",{campground:campground,currentUser:req.user});
        }
    })
});
router.post("/campgrounds/:id/comments",isloggedin,(req,res)=>{
Campground.findById(req.params.id,(err,campground)=>{
    if(err){
        console.log("the error is:"+err);
    }
    else{
       
        Comment.create(req.body.comment,(err,comment)=>{
            if(err){
                console.log(err);
            }
            else{
                comment.author.id=req.user._id;
                comment.author.username=req.user.username;
               comment.save();
                campground.comments.push(comment);
                campground.save();
                res.redirect("/campgrounds/"+campground._id);
            }
        });
    }
});
});

// =====================AUTHENTICATION ROUTES==============================

router.get("/signup",(req,res)=>{
    res.render("auth/signup",{currentUser:req.user});
});

// sign up route

router.post("/signup",(req,res)=>{
   var newuser=new User({username:req.body.username});
   User.register(newuser,req.body.password,function(err,user){
       if(err){
           console.log(err);
           return res.render("auth/signup");
       }
       passport.authenticate("local")(req,res,function(){
           res.redirect("/campgrounds");
       });
   });

});


// login route,
router.get("/login",(req,res)=>{
    res.render("auth/login",{currentUser:req.user});
});
router.get("/notfound",(req,res)=>{
    res.render("auth/notfound",{currentUser:req.user});
});


// login logic
router.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/notfound"
}),function(req,res){

});

// logout
router.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/");
});

// middleware
 function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}




module.exports = router;
     const  express=require("express");
     const app=express();
     const bodyparser=require("body-parser");

     const seedDb = require("./seed")
     const  mongoose=require("mongoose");

     const passport = require("passport");
     const loaclstrategy=require("passport-local");
     const passportlocalmongoose=require("passport-local-mongoose");
     var yelpcalm=require("./routes/yelpcalm");
   
     var User=require("./models/user");
     var port = process.env.PORT || 5000;

    
// PASSPORT CONFIG

app.use(require("express-session")({
    secret:"Abhishek jaiswal is abhiedward001",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.urlencoded({extended:true}));
passport.use(new loaclstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());   //for encoding session
passport.deserializeUser(User.deserializeUser());  // for decoding session

// ------------------------------------------------------------------------------
     app.use("",yelpcalm);
     app.use(express.static("public"));
     app.use(bodyparser.urlencoded({extended:true}));
     app.set("view engine", "ejs");
    

seedDb();

mongoose.connect("mongodb+srv://abhiedward001:abhi@123@cluster0.akhwn.mongodb.net/nbafanpage?retryWrites=true&w=majority",{ useNewUrlParser: true,useUnifiedTopology: true }).then(()=>{
    console.log("connected to dbi");
}).catch((err)=>{
    console.log("error",err);
});

app.listen(port, ()=>{
console.log("someone staretd the server");
});

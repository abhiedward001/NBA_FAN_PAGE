const mongoose=require("mongoose");
const passportlocalmongoose=require("passport-local-mongoose");

const Userschema=new mongoose.Schema({
    username:String,
    password:String
});
Userschema.plugin(passportlocalmongoose);

module.exports=mongoose.model("User",Userschema);
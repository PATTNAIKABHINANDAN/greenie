const mongoose=require('mongoose');

const ProductSchema=new mongoose.Schema({
    name:String,
    email:String,
    Phone:Number,
    userId:String,
    date:Date
})

module.exports=mongoose.model("products",ProductSchema);
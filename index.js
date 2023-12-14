const express=require("express");
const cors=require("cors");
require('./back-end/config');
const User=require('./back-end/users');
const Product=require('./back-end/products');
const app=express();
const jwt=require('jsonwebtoken');
const jwtKey='e-comm';

app.use(express.json());
app.use(cors());

// login
app.post("/register",async (req, resp) => {
    try {
        console.log(req.body); // Log the request body
        let user = new User(req.body);
        let result = await user.save();
        result =result.toObject();
        delete result.password;
        if(result){
            jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    resp.send({result: "something went wrong"})
                }
                resp.send({result, auth:token})
            })
        }
    } catch (error) {
        console.error("Error saving user:", error);
        resp.status(500).send("An error occurred while saving user.");
    }
});
app.post("/login",async(req,resp)=>{
    console.log(req.body);
    if(req.body.password && req.body.email){
        let user =await User.findOne(req.body).select("-password");
        if(user){
            jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    resp.send({result: "something went wrong"})
                }
                resp.send({user, auth:token})
            })
        }
        else{
            resp.send("result not found");
        }
    }
    // else{
    //     resp.send("result not found");
    // }
})

// list product
app.post("/add-product",verifyToken,async(req,resp)=>{
    let product=new Product(req.body);
    let result=await product.save();
    resp.send(result);
})

app.get("/products",verifyToken,async(req,resp)=>{
    let products=await Product.find();
    if(products.length>0){
        resp.send(products);
    }
    else{
        resp.send({result:"No Products are found"});
    }
});

app.delete("/product/:id",verifyToken,async (req, resp)=>{
    const result=await Product.deleteOne({_id:req.params.id});
    resp.send(req.params.id);
});

app.get("/product/:id",verifyToken,async (req, resp)=>{
    let result=await Product.findOne({_id:req.params.id});
    if(result){
        resp.send(result);
    }
    else{
        resp.send({result:"No Result Found."})
    }
});

app.put("/product/:id",verifyToken,async(req,resp)=>{
    let result=await Product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    resp.send(result);
})
app.get("/search/:key",verifyToken,async (req,resp) =>{
    let result=await Product.find({
        "$or":[
            {name:{$regex:req.params.key}},
            {company:{$regex:req.params.key}},
            {category:{$regex:req.params.key}},
        ]
    });
    resp.send(result);
})

function verifyToken(req,resp,next){
    let token = req.headers['authorization'];
    if(token){
        token=token.split(' ')[1];
        console.warn("middleware called if",token);
        jwt.verify(token,jwtKey,(err,valid)=>{
            if(err){
                resp.status(401).send({result:"Please add valid token with header"})
            }
            else{
                next();
            }
        })
    }
    else{
        resp.status(403).send({result:"Please add token with header"})
    }
}


app.listen(5000);
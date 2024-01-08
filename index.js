import express from 'express'
const app = express()

import path from 'path'

import mongoose from 'mongoose';

import cookieParser from 'cookie-parser';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcrypt'


//connect to database
mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: "backend"
}).then(() => {
    console.log("database connected");
}).catch((e) => {
    console.log(e)
})

// //create a schema
// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String
// })

// // create a model(collection)
// const mssg = mongoose.model("Message", messageSchema)

// const users = [];

//create a schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
})

// create a model(collection)
const User = mongoose.model("User", userSchema)

const users = [];



//setting up the view engine
app.set("view engine", "ejs")

//using middleware
//access (html and css) static file 
app.use(express.static(path.join(path.resolve(), "public")));
// console.log(path.join(path.resolve(),"public"))

//used to access data from endpoint(inbuilt middleware)
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

//creating a middleware for authentication

const isAuthenticated = async(req, res, next) => {
    const { token } = req.cookies;
    if (token) {
      const decoded=  jwt.verify(token,"shdsdshdhsssd")
      req.user=await User.findById(decoded._id);
      
        next();
    } else {
        res.redirect("/login")
    }
}

app.get("/", isAuthenticated, (req, res) => {
    // res.send("hi")

    // res.sendStatus(404)

    // res.json({
    //     success:true,
    //     products:[]
    // })

    // res.status(400).send("error aa gya bhai console dekh le ")

    //send the static html page
    //     const pathlocation=path.resolve();
    //    res.sendFile(path.join(pathlocation,"./index.html"))

    //send the data dynamically with help of EJS(Embedded javascript) and app.set()

    //  res.render("index")
    // res.render("index", { name: "YASH SHARMA" })

    //using middleware app.use() or express.static() we can serve the static files of pbulic folder
    // res.sendFile("index")

    //render login page
    // console.log(req.cookies.token)
    // const {token}=req.cookies;
    // if (token) {
    //     res.render("logout")
    // }else{
    //     res.render("login")
    // }

    // console.log(req.user)
    res.render("logout",{name:req.user.name},)

})

// app.get("/success", (req, res) => {
//     res.render("success")
// })

// app.post("/contact", (req, res) => {
//     // console.log(req.body)
//     console.log(req.body.name)

//     users.push({ username: req.body.name, email: req.body.email })

//     res.redirect("/success");
// })

// app.post("/contact", async (req, res) => {
//     const { name, email } = req.body;
//     // await mssg.create({ name: name, email: email })
//     await mssg.create({ name, email })
//     res.redirect("/success");
// })

// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     })
// })


//used to add data in db
// app.get("/add", async (req, res) => {

//     await mssg.create({ name: "yash sharma", email: "sharma@gmail.com" });
//     res.send("added")
// })

//login endpoint
app.post("/login", async (req, res) => {
    const { email ,password} = req.body;

const userId =await User.findOne({email})
if(!userId){
    return res.redirect("/register")
}


 const isMatch= await bcrypt.compare(password,userId.password);

 if(!isMatch){
    return res.render("login",{email,message:"Incorrect Password"});
 }

 const token=jwt.sign({_id:userId._id},"shdsdshdhsssd")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/")

});

//login-get route
app.get("/login", (req, res) => {
    res.render("login")
});

//logout endpoint
app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect("/")
});

//register-get(to show the form)
app.get("/register", (req, res) => {
res.render("register")
});

//register-post(to submit the details)
app.post("/register", async (req, res) => {
    const { name, email,password } = req.body;

const user =await User.findOne({email})
if(user){
    return res.redirect("/login")
}

const hashedPassword=await bcrypt.hash(password,10);

    const userId=await User.create({ name, email,password:hashedPassword});

    const token=jwt.sign({_id:userId._id},"shdsdshdhsssd")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/")
});



app.listen(5000, () => {
    console.log("server is working")
})
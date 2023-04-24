import  express  from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose
    .connect("mongodb://127.0.0.1:27017/",{
        dbName: "backend",
    })
    .then(()=>console.log("Database Connected"))
    .catch((e)=>console.log(e));

    const messageSchema = new mongoose.Schema({
        name: String,
        email: String,
    });

    const Message = mongoose.model("Message", messageSchema)

    const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
    });

    const User = mongoose.model("users", userSchema);

const app = express();
// const myArray = [];

//for setting/creating a static folder 
//app.use() : for using middleware
//given a path for using static file eg: index.html
app.use(express.static(path.join(path.resolve(), "public"))); 
app.use(express.urlencoded({ extended: true })); // for accessing html by post
app.use(cookieParser());

//setting up view engine (optional)
app.set("view engine", "ejs"); 


// const isAuthenticated = (req, res, next)=> {

//     const {token} = req.cookies;

//     if(token) {
//         next();
//     }
//     else {
//         res.render("login.ejs");
//     }
// };



// app.get("/", isAuthenticated, (req, res)=>{
//     // const pathLocation = path.resolve(); //set pathlocation
//     // res.sendFile(path.join(pathLocation, "./index.html")); //joining and sending path location

//     // res.render("index.ejs", {name: "mehul"});
//     // res.sendFile("./index.ejs");

//     res.render("logout.ejs");
// });

// app.get("/success", (req, res) => {
//     res.render("login.ejs");
// });

// app.post("/form", async (req, res) => {
//     // console.log(req.body);

//     const {name, email} = req.body;
//     await Message.create({name, email});
//     res.redirect("./success");
// })


// app.post("/login", (req, res)=>{
//     res.cookie("token", "iadmin", {
//         httpOnly: true,
//         expires: new Date(Date.now() + 60 * 1000),
//     });
//     res.redirect("/");
// });

// app.get("/logout", (req, res)=>{
//     res.cookie("token", null, {
//         httpOnly: true,
//         expires: new Date(Date.now()),
//     });
//     res.redirect("/");
// });

const isAuthenticated = async (req, res, next)=>{

    const {token} = req.cookies;

    if(token)
    {
        const decode = jwt.verify(token, "asdfasfasdfasd");
        req.user = await User.findById(decode._id);
        next();
    } else {
        res.render("login");
    }

};

app.get("/", isAuthenticated, (req, res)=>{
    // console.log(req.user);
    res.render("logout", {name: req.user. name});
});

app.get("/logout", (req, res) => {

    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.get("/login", (req, res)=> {
    res.render("login");
});

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;

    let user = await User.findOne({email});
    if(!user) {
        return res.redirect("register");
    }

    const isMatch = bcrypt.compare(password, user.password);
    if(!isMatch) return res.render("login", {email, message: "Incorrect Password"});
    const token = jwt.sign({_id: user._id}, "asdfasfasdfasd");

    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});

app.post("/register",  async (req, res)=>{
    
    const {name, email, password} = req.body;

    let user = await User.findOne({email});
    if(user) {
        return res.redirect("login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({_id: user._id}, "asdfasfasdfasd");

    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
});


app.listen(5000, ()=>{
    console.log("Server is Working");
});

const express = require('express');
const ejs = require('ejs')
const bodyParser = require('body-parser');
const { application } = require('express');
const app = express()
const mongoose = require('mongoose');
const { defaultConfiguration } = require('express/lib/application');

// to pass queries while redirecting.
const url = require("url");


app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine", "ejs")


// establishing mongoDb connection
mongoose.connect("mongodb://localhost:27017/InternDb");

// crating the schema of a user collection

const userSchema = new mongoose.Schema({
    id: String,
    role: String,
    avatar: String,
    name: String,
    loginId: String,
    userId: String,
    email: String,
    phone: Number,
    accountStatus: String,
    remarks: String
});

// creating the mongoose user model: 

const userModel = mongoose.model("User", userSchema); 

// adding a sample data

// const user1 = new userModel({
//    role: "ddr",
//    avatar: "link ",
//    name: "random",
//    loginId: "abcd",
//    userId: "ejgh",
//    email: "abc@gmail.com",
//    phone: 4353364442,
//    accountStatus: "active",
//    remarks: "This is a sample entry"
// })

// user1.save();



// get routes: 

app.get("/", (req,res)=>{
   res.render("home")
})
app.get("/createUser", (req,res)=>{
   res.render("createUser")
})
app.get("/readUser", (req,res)=>{
   userModel.find((err, data)=>{
      if(err) throw err; 
      res.render("readUser", {records: data})
      
   })
})

// ********************* update user ********************

app.get("/updateUser", (req,res)=>{
   let vari = req.query.q;
   let data = JSON.parse(vari);

   res.render("updateUser", {records: data});
})

// *************************** ends ********************/

app.get("/createContact", (req,res)=>{
   res.render("createContact")
})
app.get("/readContact", (req,res)=>{
   res.render("readContact")
})
app.get("/updateContact", (req,res)=>{
   let vari = req.query.
   res.render("updateContact")
})
app.get("/login", (req,res)=>{
   res.render("login")
})
app.get("/support", (req,res)=>{
   res.render("support")
})
app.get("/readMoreUser", (req,res)=>{
   let vari = req.query.q;
   let data = JSON.parse(vari);   // converting back string to object.

   console.log(data)
   res.render("readMoreUser", {ele:data})
})



// post routes: 


// crate user 


app.post("/createUser", async(req,res)=> {
   const x = req.body;
   let dataObject = new userModel({
      role: x.role,
      avatar: x.avatarUrl,
      name: x.name,
      loginId: x.loginId,
      userId: x.userId,
      email: x.email,
      phone: x.phone,
      accountStatus: x.status,
      remarks: x.remarks, 
      password: x.password
   });


  await dataObject.save();
   res.redirect("/readUser")
})

// updateUser 
app.post("/updateUser", (req,res)=>{
   const x = req.body;
   let dataObject ={
      role: x.role,
      avatar: x.avatarUrl,
      name: x.name,
      loginId: x.loginId,
      userId: x.userId,
      email: x.email,
      phone: x.phone,
      accountStatus: x.status,
      remarks: x.remarks, 
      password: x.password
   };

   const uniqueId = req.body.uniqueId;
   userModel.updateOne({_id:uniqueId}, dataObject, (err)=>{
      if(err) throw err
      console.log("updated Successfully")
      res.redirect("readUser")
   })

})

// custom routes: 
app.post("/:page/:mongoId",  (req, res)=> {
   const page = req.params.page
   const id = req.params.mongoId
   if(page === 'delete'){
      userModel.deleteOne({loginId: id}, (err,data)=>{
         res.redirect("/readUser")
      })
   }

   else if(page === 'readMore'){
      userModel.find({loginId:id}, (err,data)=>{
         // res.render("readMoreUser") then it is breaking the css of the page.(don't know why)

         // to user url, pass the query object in the form of string, and in the desired get page extract the data and convert it.
         res.redirect(url.format({
            pathname:"/readMoreUser",
            query: {
               "q" : JSON.stringify(data)   // converting the json to string to pass.
            }
         }));
      })
   }

   else if(page === 'update'){
      userModel.find({loginId:id}, (err,data)=>{
         res.redirect(url.format({
            pathname: "/updateUser",
            query: {
               "q": JSON.stringify(data)
            
            }
         }))
      })
   }

   else{
      console.log("params are: " + page)
   }
})



app.listen("3000", ()=> {console.log("server is runnng and up intern")})
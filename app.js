
const express = require('express');
const ejs = require('ejs')
const bodyParser = require('body-parser');
const { application } = require('express');
const app = express()
const mongoose = require('mongoose');
const { defaultConfiguration } = require('express/lib/application');



// for uploading files from form and working with a csv file after converting it.
const fileUpload = require('express-fileupload')
const csv = require('fast-csv'); 

// to pass queries while redirecting.
const url = require("url");


app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(fileUpload()); 
app.set("view engine", "ejs")


// establishing mongoDb connection
mongoose.connect("mongodb://localhost:27017/InternDb");

// crating the schema of a user collection

const userSchema = new mongoose.Schema({
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

// schema of contact collection:  collection of contact details: 
const contactSchema = new mongoose.Schema({
   // this will take all the additonal details of the contacts. It will be exactly similar to the user model with different fields.
   // therefore for saving time I am not repeating this and I will make a separate collection for storing data of contact.
})




// creating the mongoose user model: 

const userModel = mongoose.model("User", userSchema); 
const csvModel = require(__dirname+"/modules/contactCsv.js"); 

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

// **************************** user get routes ************************

app.get("/createUser", (req,res)=>{
   res.render("createUser")
})
app.get("/readUser", (req,res)=>{
   userModel.find((err, data)=>{
      if(err) throw err; 
      res.render("readUser", {records: data})
      
   })
})

app.get("/readMoreUser", (req,res)=>{
   let vari = req.query.q;
   
   userModel.find({loginId: vari}, (err,data)=> {
      res.render("readMoreUser", {ele:data});
   })
})

app.get("/updateUser", (req,res)=>{
   let vari = req.query.q;
   userModel.find({loginId:vari}, (err, data)=>{
      res.render("updateUser", {records: data})
   })
})

// ********************* contacts get routes ******************************
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


// create contact *******

app.post("/createContact", (req,res)=> {
   const read = req.files.file.data
   var result = []
   console.log(read)

   csv.parseString(read.toString(), {
      headers: true,
      ignoreEmpty: true
   }).on("data", (data)=> {
      data['_id'] = new mongoose.Types.ObjectId();
      result.push(data)
   }).on("end", ()=> {
      console.log(result)
      csvModel.insertMany(result, (err)=> {
         if(err) throw err; 
         res.send("Data sucessfully added in the collection")
      })
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

      res.redirect(url.format({
         pathname: "/readMoreUser",
         query: {
            "q" : id
         }
      }));
   }

   else if(page === 'update'){
      // userModel.find({loginId:id}, (err,data)=>{
      //    res.redirect(url.format({
      //       pathname: "/updateUser",
      //       query: {
      //          "q": JSON.stringify(data)
            
      //       }
      //    }))
      // })

      res.redirect(url.format({
         pathname:"/updateUser",
         query: {
            "q": id
         }
      }))
   }

   else{
      console.log("params are: " + page)
   }
})



app.listen("3000", ()=> {console.log("server is runnng and up intern")})
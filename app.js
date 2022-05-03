const express = require('express');
const ejs = require('ejs')
const bodyParser = require('body-parser');
const {
   application
} = require('express');
const app = express()
const mongoose = require('mongoose');
const {
   defaultConfiguration
} = require('express/lib/application');



// for uploading files from form and working with a csv file after converting it.
const fileUpload = require('express-fileupload')
const csv = require('fast-csv');

// to pass queries while redirecting.
const url = require("url");
const {
   stringify
} = require('querystring');


app.use(bodyParser.urlencoded({
   extended: true
}))
app.use(express.static("public"))
app.use(fileUpload());
app.set("view engine", "ejs")


// establishing mongoDb connection
mongoose.connect("mongodb+srv://admin-ayussh:test123@cluster0.t3mdo.mongodb.net/InternDb");

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




// creating the mongoose user model & contact model. 

const userModel = mongoose.model("User", userSchema);
const csvSchema = require(__dirname + "/modules/contactCsv.js");

// creating the contact model: 
const contactSchema = new mongoose.Schema({
   // write all the additional fields names here: 
   docTitle: String,
   domain: String,
   location: String,
   filledBy: String,
   csvDocArr: [csvSchema]
});

const contactModel = new mongoose.model("contact", contactSchema);

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

app.get("/", (req, res) => {
   res.render("home")
})

// **************************** user get routes ************************

app.get("/createUser", (req, res) => {
   res.render("createUser")
})
app.get("/readUser", (req, res) => {
   userModel.find((err, data) => {
      if (err) throw err;
      res.render("readUser", {
         records: data
      })

   })
})

app.get("/readMoreUser", (req, res) => {
   let vari = req.query.q;

   userModel.find({
      loginId: vari
   }, (err, data) => {
      res.render("readMoreUser", {
         ele: data
      });
   })
})

app.get("/updateUser", (req, res) => {
   let vari = req.query.q;
   userModel.find({
      loginId: vari
   }, (err, data) => {
      res.render("updateUser", {
         records: data
      })
   })
})

// ********************* contacts get routes ******************************
app.get("/createContact", (req, res) => {
   res.render("createContact")
})
app.get("/readContact", (req, res) => {
   res.render("readContact")
})
app.get("/updateContact", (req, res) => {
   let vari = req.query.
   res.render("updateContact")
})



app.get("/login", (req, res) => {
   res.render("login")
})
app.get("/support", (req, res) => {
   res.render("support")
})





// post routes: 


// crate user 


app.post("/createUser", async (req, res) => {
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
app.post("/updateUser", (req, res) => {
   const x = req.body;
   let dataObject = {
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
   userModel.updateOne({
      _id: uniqueId
   }, dataObject, (err) => {
      if (err) throw err
      console.log("user updated Successfully")
      res.redirect("readUser")
   })

})


// create contact *******

app.post("/createContact", (req, res) => {
   const read = req.files.file.data
   var result = []
   // console.log(read)

   csv.parseString(read.toString(), {
      headers: true,
      ignoreEmpty: true
   }).on("data", (data) => {
      data['_id'] = new mongoose.Types.ObjectId();
      result.push(data)
   }).on("end", () => {

      // note: write the insertion code inside the .on('end') because it is sync function, if you write insertion code outside, then it wil be executed before performing the operations in the .on("data") function therefore will yield erros

      // console.log("the result is ");
      // console.log(result)         // don't display the array and objects etc with strings with the help of + operators. 


      var doc = {
      docTitle: req.body.docTitle,
      domain: req.body.domain,
      location: req.body.location,
      filledBy: req.body.ListCreatedBy,
      csvDocArr: result
      }
   
      contactModel.insertMany(doc, (err)=> {
         if(err) throw err;
         console.log("contactModel updated successfully")
      })
   
   })
   
   
   res.send(
      "<h1> Added successfully </h1> <p> after adding the page should be redirected to the /readContact page (/readContact page is not completed yet) </p>  <p> The /readContact page will be exacty similar to the /readUser page, with the same update, delete and read functionality, and an additional download csv button will be added. (refer /readUser page to evaluate /readContact)</p>")

})




// custom routes: 
app.post("/:page/:mongoId", (req, res) => {
   const page = req.params.page
   const id = req.params.mongoId
   if (page === 'delete') {
      userModel.deleteOne({
         loginId: id
      }, (err, data) => {
         res.redirect("/readUser")
      })
   } else if (page === 'readMore') {

      res.redirect(url.format({
         pathname: "/readMoreUser",
         query: {
            "q": id
         }
      }));
   } else if (page === 'update') {
      // userModel.find({loginId:id}, (err,data)=>{
      //    res.redirect(url.format({
      //       pathname: "/updateUser",
      //       query: {
      //          "q": JSON.stringify(data)

      //       }
      //    }))
      // })

      res.redirect(url.format({
         pathname: "/updateUser",
         query: {
            "q": id
         }
      }))
   } else {
      console.log("params are: " + page)
   }
})



app.listen(process.env.PORT || "3000", () => {
   console.log("server is runnng and up intern")
})
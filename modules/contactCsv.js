const mongoose = require('mongoose');

const csvSchema = new mongoose.Schema({
    Name: String,
    Title: String,
    Email: String,
    Linkedin: String,
    Company: String,
    Industry: String,
    Website: String,
    Headquarters: String,
    Revenue: String,
    'Company size': String
    
}); 



module.exports = csvSchema; 
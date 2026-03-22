const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title:{type:String, required:true},
  location:{type:String, required:true},
  role:{
type:String,
enum:["agent","seeker"],
default:"seeker"
}
  type:{type:String, enum:['Lodge','Hostel','Self-Contained','Apartment'], required:true},
  price:{type:Number, required:true},
  agentId:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  image:{type:String, default:'placeholder.jpg'}
},{timestamps:true});

module.exports = mongoose.model('Property', propertySchema);

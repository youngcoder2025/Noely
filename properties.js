const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Property = require('../models/Property');

// GET properties
router.get('/', async (req,res)=>{
  try{
    const properties = await Property.find().populate('agentId','name email role');
    res.json(properties);
  }catch(err){res.status(500).json({message:'Server error'});}
});

// CREATE property (Landlord)
router.post('/', auth, async (req,res)=>{
  if(req.user.role!=='Landlord') return res.status(403).json({message:'Only landlords can add'});
  try{
    const {title,location,type,price,image} = req.body;
    const property = new Property({title,location,type,price,image,agentId:req.user.id});
    await property.save();
    res.json(property);
  }catch(err){res.status(500).json({message:'Server error'});}
});

module.exports = router;
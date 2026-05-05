const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const College = require('../models/College');

async function checkCollege() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const college = await College.findOne({ college_code: 'E254' });
    if (college) {
      console.log('College found:', JSON.stringify(college, null, 2));
    } else {
      console.log('College E254 NOT found in database.');
      const all = await College.find({}).limit(5).select('college_code college_name');
      console.log('Available colleges (first 5):', all);
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCollege();

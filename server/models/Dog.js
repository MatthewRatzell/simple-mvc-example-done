const mongoose = require('mongoose');

let DogModel = {};

const DogSchema = new mongoose.Schema({
  // balls pt 1
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  // balls the prequel(comes in special blue box)
  breed: {
    type: String,
    required: true,
    trim: true,
  },
  // balls pt 2 the return of  the ball;s
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  //
  createdDate: {
    type: Date,
    default: Date.now,
  },

});
  // Create the cat model based on the schema. You provide it with a custom discriminator
  // (the name of the object type. Can be anything)
  // and the schema to make a model from.
  // Look at the model variable definition above for more details.
DogModel = mongoose.model('Dog', DogSchema);

// We only want to export the cat model, so we can overwrite the entire exports object.
module.exports = DogModel;

// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const { Cat } = models;
const { Dog } = models;
// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

const defaultDataDog = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);

let lastAddedDog = new Dog(defaultDataDog);

// Function to handle rendering the index page.
const hostIndex = (req, res) => {
  /* res.render will render the given view from the views folder. In this case, index.
     We pass it a number of variables to populate the page.
  */
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// Function for rendering the page1 template
// Page1 has a loop that iterates over an array of cats
const hostPage1 = async (req, res) => {
  /* Remember that our database is an entirely separate server from our node
     code. That means all interactions with it are async, and just because our
     server is up doesn't mean our database is. Therefore, any time we
     interact with it, we need to account for scenarios where it is not working.
     That is why the code below is wrapped in a try/catch statement.
  */
  try {
    /* We want to find all the cats in the Cat database. To do this, we need
       to make a "query" or a search. Queries in Mongoose are "thenable" which
       means they work like promises. Since they work like promises, we can also
       use await/async with them.

       The result of any query will either throw an error, or return zero, one, or
       multiple "documents". Documents are what our database stores. It is often
       abbreviated to "doc" or "docs" (one or multiple).

       .find() is a function in all Mongoose models (like our Cat model). It takes
       in an object as a parameter that defines the search. In this case, we want
       to find every cat, so we give it an empty object because that will not filter
       out any cats.

       .lean() is a modifier for the find query. Instead of returning entire mongoose
       documents, .lean() will only return the JS Objects being stored. Try printing
       out docs with and without .lean() to see the difference.

       .exec() executes the chain of operations. It is not strictly necessary and
       can be removed. However, mongoose gives better error messages if we use it.
    */
    const docs = await Cat.find({}).lean().exec();

    // Once we get back the docs array, we can send it to page1.
    return res.render('page1', { cats: docs });
  } catch (err) {
    /* If our database returns an error, or is unresponsive, we will print that error to
       our console for us to see. We will also send back an error message to the client.

       We don't want to send back the err from mongoose, as that would be unsafe. You
       do not want people to see actual error messages from your server or database, or else
       they can exploit them to attack your server.
    */
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

// Function to render the untemplated page2.
const hostPage2 = (req, res) => {
  res.render('page2');
};

// Function to render the untemplated page3.
const hostPage3 = (req, res) => {
  res.render('page3');
};

// Function to render the untemplated page3.
const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();

    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ error: 'failed to find dogs' });
  }
};

// Get name will return the name of the last added cat.
const getName = (req, res) => res.json({ name: lastAdded.name });

// Function to create a new cat in the database
const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname, lastname and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {
    await newCat.save();

    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// Function to create a new cat in the database
const setDogName = async (req, res) => {
  // make sure we are getting all of our data
  if (!req.body.name || !req.body.breed || !req.body.age) {
    // If they are missing data, send back an error.

    return res.status(400).json({ error: 'Yo dude, you able to read? It needs a name, an age, and a breed. If you dont know its breed just use google' });
  }

  // make the dawg OG
  const dogData = {
    name: `${req.body.name}`,
    breed: `${req.body.breed}`,
    age: `${req.body.age}`,
  };

  // actually create our dawg OG object
  const newDog = new Dog(dogData);

  // done updating the state in the node server send the jawns to the actual db
  try {
    // dog object has extra capabilitys because it is a DB object so it has save
    await newDog.save();

    // brickity splittity send the shit to the client rickity
    lastAddedDog = newDog;

    return res.json({
      name: lastAddedDog.name,
      breed: lastAddedDog.breed,
      age: lastAddedDog.age,
    });
  } catch (err) {
    // If something goes wrong while communicating with the database, log the error and send
    // an error message back to the client.
    console.log(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};
// Function to handle searching a cat by name.
const searchDogName = async (req, res) => {
  /* When the user makes a POST request, bodyParser populates req.body with the parameters
     as we saw in setName() above. In the case of searchName, the user is making a GET request.
     GET requests do not have a body, but they can have query parameters. bodyParser will also
     handle these, and store them in req.query instead.

     If the user does not give us a name to search by, throw an error.
  */
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  // if we actually have a name try this
  try {
    /*
           One of three things will occur when trying to findOne in the database.
            1) An error will be thrown,
            2) Everything works, but the name was not found in the database empty object
            3) Everything works, and an object matching the search is found.
    */
    // find the one specific dog we are looking for
    const doc = await Dog.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No dogs found, try searching a name that exists' });
    }
    // else increase its age and than return it

    // First we will update the age of the found doc.
    doc.age++;

    // updates
    const savePromise = doc.save();

    // If we successfully save/update them in the database, send back the cat's info.
    return savePromise.then(() => res.json({ name: doc.name, breed: doc.breed, age: doc.age }));
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
// Function to handle searching a cat by name.
const searchName = async (req, res) => {
  /* When the user makes a POST request, bodyParser populates req.body with the parameters
     as we saw in setName() above. In the case of searchName, the user is making a GET request.
     GET requests do not have a body, but they can have query parameters. bodyParser will also
     handle these, and store them in req.query instead.

     If the user does not give us a name to search by, throw an error.
  */
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  /* If they do give us a name to search, we will as the database for a cat with that name.
     Remember that since we are interacting with the database, we want to wrap our code in a
     try/catch in case the database throws an error or doesn't respond.
  */
  try {
    const doc = await Cat.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

/* A function for updating the last cat added to the database.
   Usually database updates would be a more involved process, involving finding
   the right element in the database based on query, modifying it, and updating
   it. For this example we will just update the last one we added for simplicity.
*/
const updateLast = (req, res) => {
  // First we will update the number of bedsOwned.
  lastAdded.bedsOwned++;

  /* Remember that lastAdded is a Mongoose document (made on line 14 if no new
     ones were made after the server started, or line 116 if there was). Mongo
     documents have an _id, which is a globally unique identifier that distinguishes
     them from other documents. Our mongoose document also has this _id. When we
     call .save() on a document, Mongoose and Mongo will use the _id to determine if
     we are creating a new database entry (if the _id doesn't already exist), or
     if we are updating an existing entry (if the _id is already in the database).

     Since lastAdded is likely already in the database, .save() will update it rather
     than make a new cat.

     We can use async/await for this, or just use standard promise .then().catch() syntax.
  */
  // updates
  const savePromise = lastAdded.save();

  // If we successfully save/update them in the database, send back the cat's info.
  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  // If something goes wrong saving to the database, log the error and send a message to the client.
  savePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  setName,
  updateLast,
  searchName,
  searchDogName,
  setDogName,
  notFound,
};

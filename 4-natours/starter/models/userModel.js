const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Create a schema with 5 fields
// name, email, photo (String), password, passwordConfirm
const userSchema = new mongoose.Schema({
  // into Schema() pass our schema as an object, can also pass some options
  // mongoose uses the native JS datatypes
  // 1st object is schema definition
  name: {
    // pass in schema type options
    type: String,
    required: [true, 'Please tell us your name'], // validator - used to validate our data
    trim: true,
    maxlength: [200, 'Name cannot have more than 20 characters'], // error if longer
    minlength: [1, 'Name cannot have less than 1 character']
    // validate: [validator.isAlpha, 'Tour name must be all letters'] // won't allow space also
  },
  email: {
    // used by the user to login, no username property
    type: String,
    // not making it required, because it's not on the front page (overview) of our website
    // trim only works for strings, different schema types for different types like trim() in java
    unique: true,
    trim: true,
    lowercase: true, // not a validator, just transforms the email into lower case
    required: [true, 'Please provide your email'],
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    // user - general user
    // guide - tour guide
    // lead-guide - lead tour guide
    // admin - administrator
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'A password cannot have less than 8 characters'],
    // some more fields later, validators to see if confirmation password is same as main password
    select: false // automatically never show in any output
  },
  passwordConfirm: {
    // put in your password and confirm it to make sure they are the same
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // instead of message, validator can do it with an array as well, but it would look wierd
      message: 'Passwords are not the same!', // {VALUE} is internal to mongoose, nothing to do with JS
      validator: function(el) {
        // not an arrow function but a real function.. this points to current document ONLY when we are creating a new document
        // this function is not going to work on update
        // this only points to current doc on NEW document creation
        // if you don't need this variable then use arrow function
        // return a true or a false, if false then error
        // only gonna work on save or create, not update
        // for this reason whenever we want to update we will have to use save as well and not findOneAndUpdate like we did with our tours
        return this.password === el;
      }
    }
  },
  // when someone changes password
  // most users may not have this property
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, // because this reset will expire after a certain amount of time (10 mins) as a security measure
  active: {
    type: Boolean,
    default: true,
    select: false // hide this implementation detail from the user
  }
});

userSchema.pre('save', async function(next) {
  // we want to encrypt the password only if the password field has been updated
  // this refers to the current document.. in this case current user
  // we have a method on all documents which we can use if a certain field has been modified
  // if the password has not been modified, exit the function and call the next middleware
  // Only run this function if the password was actually modified
  if (!this.isModified('password')) return next();

  // this.start = Date.now();

  // hashing passwords with b-crypt- well known, well studied algo. first sale and then hash our password to make it strong against brute force attacks
  // salt our password- add a arandom string to the password, two equal passwords do not generate the same hash
  // this has is the async version, there is also a sync version but we do not want to use it and block the event loop and prevent other users from using the application
  // hash the password with a cost of 12
  this.password = await bcrypt.hash(
    this.password,
    process.env.HASH_COST * 1 || 12
  );
  // 2nd parameter the salt can be manually generated, but to make it easier we can simply pass in a cost (CPU cost)- default is 10 I believe.. how CPU intensive this operation will be and how much better encrypted the password will be.. computers are getting powerful so 20 years ago you could have used 8.. 12 is good for now.. go higher but it would take way too long..

  // Delete the passwordConfirm field
  // delete the confirm password, we only have the real password hashed
  this.passwordConfirm = undefined; // this is how we delete a field, so it is not persisted in DB.. we only need passwordConfirm for the validation that we implemented before
  // required above means it is a required input, not that it is required to be persisted to DB
  next();
});

// userSchema.post('save', function(docs, next) {
//   // console.log(docs);
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   next();
// });

// runs right before a new document is actually saved
// behind the scenes without us having to worry about it
userSchema.pre('save', async function(next) {
  // only want to update passwordChangedAt to now when password is modified
  // simple tricks that make all the difference
  if (!this.isModified('password') || this.isNew) return next(); // return right away and run the next middleware
  // for creating new documents also we modified the password so this will trigger on new also

  // In theory this should work just fine, but in practice sometimes there is a small problem
  // saving to the DB is slower than issuing the JWT
  // so passwordChangedAt timestamp is a bit after the JWT was issued
  // then the user will not be able to login with the new token
  // fix that by subtracting one second from here
  // small hack
  this.passwordChangedAt = Date.now() - 1000; // 1s behind, not accurate but that's no problem
  next();
});

// QUERY MIDDLEWARE to root out inactive users
userSchema.pre(/^find/, function(next) {
  // find, findOne, findOneAndDelete, findOneAndUpdate,..
  this.find({ active: true }); // this is a query object & we have to do it like this because the other objects are not set to false, they simply do not have this attribute
  next();
});

// function to check if the given password is the same as the one stored in the document
// create an instance method- available on all documents of a certain collection
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // this is the current document, since instance methods are available on the document
  // but password is select: false so this.password is not available
  // true if same, even as userPasssword is hashed
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 1st argument is JWT timestamp which says when the token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  // in an instance method this keyword points to current document
  // does the property exist
  // set this property artifically in Postman for now for a new user, implement in code a little later
  // "passwordChangedAt": "2019-04-30"
  if (this.passwordChangedAt) {
    // const changedTimestamp = this.passwordChangedAt.getTime() / 1000; // also appears to work!
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // ms -> s
    return changedTimestamp > JWTTimestamp; // seconds from epoch since JWT was issued should be more than seconds since epoch in change password
  }

  return false; // user has not changed his password after the token was issued
};

userSchema.methods.createPasswordResetToken = function() {
  // the password reset token shoudl be a random string
  // but it has to be as cryptographically strong as the password hash we created before
  // use randomBytes() from the built in crypto module
  // 32 characters, adn convert it to a hexadecimal string
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // logging it as an object, so it will tell me the variable name along with its value
  // console.log({ resetToken }, this.passwordResetToken); // { this.passwordResetToken } doesn't work with writing objects the ES6 way so leave as is

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins in ms

  // we have not saved/updated the document, do that back in the authController
  // return the plain text token to send via email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

// this is the only thing we export from here
module.exports = User;

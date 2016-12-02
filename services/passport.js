const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

//setup options for jwt Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

//Setuo local strategy
const localOptions = { usernameField: "email" };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  //Verify this username and password, call done with the user
  //if it is the username and password
  //otherwise call done with false
  User.findOne({email: email}, function(err, user){
    if(err) { return done(err); }
    if(!user) { done(null, false); }

    //compare password
    user.comparePassword(password, function(err, isMatch){
        if(err) { return done(err); }
        if(!isMatch) { return done(null, false) }

        return done(null, user);
    });
  });

});

//create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
  // See if the user id in the payload exist in our database
  //if it does , call done with that other
  //otherwise call done without user object
  User.findById(payload.sub, function(err, user){
    if(err) { return done(err, false); }

    if(user) {
      done(null, user);
    }else {
      done(null, false);
    }
  });

});

//tell passport to use this Strategy
passport.use(jwtLogin);
passport.use(localLogin);

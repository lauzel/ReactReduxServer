const jwt = require('jwt-simple');
const config = require('../config');
const User = require('../models/user');

function tokenForUser(user){
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp } , config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) {
    return res.status(422).send({error:'you must provide email and password'});
  }

  User.findOne({email: email}, function(err, user){
      if(err) { return next(err); }

      if(user) {
        return res.status(422).send({error: 'Email is in use'});
      }

      const newUser = new User({
        email: email,
        password: password
      });

      newUser.save(function(err){
        if(err) { return next(err); }

        res.json({ token: tokenForUser(newUser) });
      });
  });
}

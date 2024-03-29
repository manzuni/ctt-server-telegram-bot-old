// Attempt to authenticate a user when visiting a route that requires authentication
//http://www.passportjs.org/
import passport from "passport";
import User from "../models/user.mjs";
import dotenv from "dotenv";

import JwtStrategy from "passport-jwt/lib/strategy.js";
import ExtractJwt from "passport-jwt/lib/extract_jwt.js";
import LocalStrategy from "passport-local";
// Init .env
dotenv.config();

const passportService = () => {
  //Create local strategy for sign in
  const localLogin = new LocalStrategy(
    { usernameField: "email" },
    (email, password, done) => {
      // Verify this email and password, call done with user if it is the correct email and password
      //Otherwise call down with false

      User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false);

        //Compare passwords
        user.comparePassword(password, (err, isMatch) => {
          if (err) return done(err);
          if (!isMatch) return done(null, false);

          return done(null, user); // thank you passport for making things easier <3 This gets passed into authentication/ SignIn function
        });
      });
    }
  );

  //1. Setup options for JWT Strategy
  const jwtOptions = {
    // Whenever a request comes in, Passport needs to look at the request header, called authorization to find the token
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    // We also need to pass the secret to Passport to decode the payload, the encoded JWT Token
    secretOrKey: process.env.JWT_SECRET,
  };

  //2. Create JWT Strategy
  const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    // (payload, done) is acallback function for whenever we need to authenticate a user using jwt.
    // Payload { sub, id} is the decoded jwt token, done is callback function
    // See if the user id and the payload exists in our database
    // If it does, call done with that user, otherwise call done without a user object
    User.findById(payload.sub, (err, user) => {
      if (err) return done(err, false); // There was a problem in searching for the user, the person is not authed

      if (user) {
        done(null, user); // null = no error, return the user
      } else {
        done(null, false); // no error, return false cause there is no user
      }
    });
  });

  //3. Tell passport to use this strategy
  passport.use(jwtLogin);
  passport.use(localLogin);
};

export default passportService();

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User as UserType } from "../types/user.type";
import User from "../models/user.model";

// Local Strategy

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // Use email instead of username
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }

        const isMatch = await user.isPasswordCorrect(password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        "https://byte-messenger-api.onrender.com/api/v1/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = Array.isArray(profile.emails) && profile.emails[0].value;
        const avatar = Array.isArray(profile.photos) && profile.photos[0].value;
        // Find user by email
        let user = await User.findOne({ email });

        // If no user, create a new one
        if (!user) {
          user = await User.create({
            userName: profile.displayName,
            email,
            avatar,
            googleId: profile.id, // Store Google ID
            verified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, {});
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user?.id); // user.id should now exist
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

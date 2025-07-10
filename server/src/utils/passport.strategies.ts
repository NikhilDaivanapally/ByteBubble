import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";
import { userSelectFields } from "../constants/user-select-fields";
import { BACKEND_URL } from "../config";
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
      callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            userName: profile.displayName,
            email,
            avatar,
            googleId: profile.id,
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

// Serialize user: store user ID in session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user: retrieve user by ID from database
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select(userSelectFields);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

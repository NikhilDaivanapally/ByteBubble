import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import redis from "./db/redis";
import { RedisStore } from "connect-redis";
import passport from "./utils/passport.strategies";
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { gridFSBucket } from "./db/connectDB";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and Authorization headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure session with Redis store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    store: new RedisStore({ client: redis, ttl: 24 * 60 * 60 }), // TTL = 1 day
    resave: false,
    saveUninitialized: false,
    cookie: {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Secure cookies in production
      // sameSite: "none", // Required for cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    },
  })
);

// Configure Passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

// Trust proxy for secure cookies in production
app.set("trust proxy", 1); // `1` for one level of proxy (e.g., Vercel)

app.get("/api/audio/:id", (req, res) => {
  const fileId = req.params.id;

  try {
    // Convert string ID to ObjectId
    const objectId = new ObjectId(fileId);
    const downloadStream = gridFSBucket!.openDownloadStream(objectId);

    res.set("Content-Type", "audio/webm"); // Adjust MIME type if necessary
    downloadStream.pipe(res);

    downloadStream.on("error", (err: Error) => {
      res.status(404).send({ error: "Audio not found", details: err.message });
    });

    // res.on("finish", () => {
    //   console.log("Audio served successfully.");
    // });
  } catch (err: any) {
    res.status(400).send({ error: "Invalid audio ID", details: err.message });
  }
});

// API routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);

// Default route
app.use("/", (_, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Your backend is working fine 👍🏼",
  });
});

export { app };

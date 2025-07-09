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
import { ensureAuthenticated } from "./middlewares/auth.middleware";
import { v2 } from "cloudinary";
import { convertPdfFirstPageToImage } from "./utils/convertPdfFirstPageToImage";
import fs from "fs";
import { upload } from "./middlewares/multer.middleware";
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

app.get("/api/audio/:id", ensureAuthenticated, (req, res) => {
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
  } catch (err: any) {
    res.status(400).send({ error: "Invalid audio ID", details: err.message });
  }
});

// API routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);

app.post(
  "/api/v1/upload",
  upload.single("file"),
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    const filePath = req?.file?.path;
    const originalName = req?.file?.originalname as string;
    const mimeType = req?.file?.mimetype;

    try {
      let previewUrl = null;
      let fileUrl = null;

      if (mimeType?.startsWith("image/") && filePath) {
        const uploadResult = await v2.uploader.upload(filePath, {
          folder: "chat-media",
          resource_type: "image",
          use_filename: true,
        });
        previewUrl = uploadResult.secure_url;
        fileUrl = previewUrl;
        fs.unlinkSync(filePath);
        res.status(200).json({
          success: true,
          message: {
            imageUrl: fileUrl,
            description: null,
          },
        });
        return;
      } else if (mimeType == "application/pdf" && filePath) {
        previewUrl = await convertPdfFirstPageToImage(filePath);
      }
      //  All other files (DOCX, MP3, ZIP,MP3, MP4, etc.)
      // GridFS storage
      const uploadStream = gridFSBucket.openUploadStream(originalName, {
        contentType: mimeType,
      });
      if (!filePath) return;

      fs.createReadStream(filePath).pipe(uploadStream);

      uploadStream.on("finish", () => {
        fs.unlinkSync(filePath);

        if (mimeType?.startsWith("audio/")) {
          res.json({
            success: true,
            message: {
              fileId: uploadStream.id,
              fileName: originalName,
              fileType: mimeType,
              size: uploadStream.length,
              duration: req.body?.duration,
              source: req.body?.source,
            },
          });
          return;
        }
        res.json({
          success: true,
          message: {
            fileId: uploadStream.id,
            fileName: originalName,
            fileType: mimeType,
            size: uploadStream.length,
            previewUrl,
          },
        });
        return;
      });
    } catch (error) {
      fs.unlinkSync(filePath as string);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);
app.get(
  "/api/v1/upload/:id",
  // ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const objectId = new ObjectId(req.params.id);
      const file = await gridFSBucket!.find({ _id: objectId }).toArray();

      if (!file || file.length === 0) {
        res.status(404).json({ success: false, error: "File not found" });
        return;
      }

      const fileInfo = file[0];
      const mimeType = fileInfo.contentType || "audio/webm"; // fallback

      const downloadStream = gridFSBucket!.openDownloadStream(objectId);
      res.set({
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileInfo.filename}"`,
      });

      //  "Content-Disposition": `attachment; filename="${file.filename}"`,
      downloadStream.pipe(res);

      downloadStream.on("error", (err: Error) => {
        res.status(500).json({
          success: false,
          error: "Download stream error",
          message: err.message,
        });
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: "Invalid ObjectId or other error",
        message: err.message,
      });
    }
  }
);

// Default route
app.use("/", (_, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Your backend is working fine 👍🏼",
  });
});

export { app };

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
import { COOKIE_SECURE, FRONTEND_URL } from "./config";
const app = express();

app.use(
  cors({
    origin: FRONTEND_URL, // Frontend origin
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
      httpOnly: true,
      secure: COOKIE_SECURE, // true in production, false locally  // Secure cookies in production
      sameSite: COOKIE_SECURE ? "none" : "lax", // 'none' for cross-site cookies with HTTPS  // Required for cross-origin cookies
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
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "previewFile", maxCount: 1 },
  ]),
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    const file = req.files?.["file"]?.[0];
    const previewFile = req.files?.["previewFile"]?.[0];
    const filePath = file?.path;
    const previewFilePath = previewFile?.path;
    const originalName = file?.originalname as string;
    const mimeType = file?.mimetype;

    if (!filePath || !mimeType) {
      res.status(400).json({ success: false, error: "File missing" });
      return;
    }

    try {
      let previewUrl: string | null = null;
      let fileUrl: string | null = null;

      // 🖼️ IMAGE upload (to Cloudinary)
      if (mimeType.startsWith("image/")) {
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
      }

      // 📄 PDF upload: Preview is sent by client as previewFile
      if (mimeType === "application/pdf" && previewFilePath) {
        const previewUploadResult = await v2.uploader.upload(previewFilePath, {
          folder: "chat-media/previews",
          resource_type: "image",
          use_filename: true,
        });

        previewUrl = previewUploadResult.secure_url;
        fs.unlinkSync(previewFilePath);
      }

      // 📦 Other file types (ZIP, MP3, DOCX, etc.) → GridFS
      const uploadStream = gridFSBucket.openUploadStream(originalName, {
        contentType: mimeType,
      });

      fs.createReadStream(filePath).pipe(uploadStream);

      uploadStream.on("finish", () => {
        fs.unlinkSync(filePath);

        // 🎵 AUDIO file metadata response
        if (mimeType.startsWith("audio/")) {
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

        // 🧾 Other file response (PDF, DOCX, etc.)
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
      if (filePath) fs.unlinkSync(filePath);
      if (previewFilePath) fs.unlinkSync(previewFilePath);

      res.status(500).json({
        success: false,
        error: "Upload failed",
        message: (error as Error).message,
      });
      return;
    }
  }
);

app.get(
  "/api/v1/upload/:id",
  ensureAuthenticated,
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

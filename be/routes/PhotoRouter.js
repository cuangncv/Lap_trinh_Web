const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "..", "images");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.]/g, "");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage });

router.post("/new", upload.single("photo"), async (req, res) => {
  try {
    const { user_id } = req.body;
    const file = req.file;

    if (!user_id || !file) {
      return res.status(400).json({ message: "Missing user_id or file" });
    }

    const newPhoto = new Photo({
      user_id: user_id,
      file_name: file.filename,
      date_time: new Date(),
      comments: [],
    });
    await newPhoto.save();
    res.status(201).json({ message: "Upload successful", photo: newPhoto });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const photos = await Photo.find(
      { user_id: userId },
      "_id user_id comments file_name date_time"
    ).lean();

    if (!photos.length) return res.status(200).json([]);

    for (const photo of photos) {
      for (const comment of photo.comments) {
        const user = await User.findById(comment.user_id)
          .select("_id first_name last_name")
          .lean();
        comment.user = user || null;
      }
    }

    res.status(200).json(photos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json(photos);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:photo_id", async (req, res) => {
  try {
    const { comment, user_id } = req.body;
    if (!comment || !user_id) {
      return res.status(400).json({ message: "Missing comment or user_id" });
    }
    const { photo_id } = req.params;
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    const newComment = { comment, date_time: new Date(), user_id: user_id };
    photo.comments.push(newComment);
    await photo.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:photo_id", async (req, res) => {
  try {
    const { photo_id } = req.params;
    const { user_id } = req.body;   

    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    if (photo.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const filePath = path.join(IMAGES_DIR, photo.file_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await photo.deleteOne();

    res.status(200).json({ message: "Photo deleted", photo_id });
  } catch (err) {
    console.error("Delete photo error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:photo_id/:comment_id", async (req, res) => {
  try {
    const { photo_id, comment_id } = req.params;
    const { user_id } = req.body;
    const photo = await Photo.findById(photo_id);
    const comment = photo.comments.id(comment_id);
    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Permission denied" });
    }
    comment.deleteOne();
    await photo.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:photo_id/:comment_id", async (req, res) => {
  const { photo_id, comment_id } = req.params;
  const { comment, user_id } = req.body;
  const photo = await Photo.findById(photo_id);
  const suaComment = photo.comments.id(comment_id);
  if (suaComment.user_id.toString() !== user_id) {
    return res.status(403).json({ message: "Permission denied" });
  }
  suaComment.comment = comment;
  suaComment.date_time = new Date();
  await photo.save();
  res.json({ message: "Comment updated" });
});

module.exports = router;

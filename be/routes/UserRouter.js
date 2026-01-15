const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session?.userId) return res.sendStatus(401);
  next();
}

router.post("/register", async (request, response) => {
  try {
    const {
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password,
    } = request.body;
    if (!first_name || !last_name || !login_name || !password) {
      return response.status(400).json({ message: "Missing required fields" });
    }
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password,
    });
    await newUser.save();

    response.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    response.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (request, response) => {
  try {
    const { login_name, password } = request.body;
    const user = await User.findOne({ login_name });
    if (!user) {
      return response.status(401).json({ message: "User not found" });
    }
    if (user.password !== password) {
      return response.status(401).json({ message: "Incorrect password" });
    }
    request.session.userId = user._id;
    const userResponse = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    };
    response.status(200).json(userResponse);
  } catch (error) {
    console.error("Error logging in user:", error);
    response.status(500).json({ message: "Error logging in user" });
  }
});

router.patch("/changepassword", async (req, res) => {
  try {
    const { login_name, oldPassword, newPassword } = req.body;

    if (!login_name || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(404).json({ message: "Password is incorrect" });
    }
    if (user.password !== oldPassword) {
      return res.status(401).json({ message: " Password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (request, response) => {
  if (!request.session) {
    return response.status(200).json({ message: "No session to destroy" });
  }

  request.session.destroy((err) => {
    if (err) {
      return response.status(500).json({ message: "Error logging out" });
    }
    response.clearCookie("connect.sid");

    return response.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/list", async (request, response) => {
  try {
    const users = await User.find();
    response.json(users);
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/photoCount/:id", async (req, res) => {
  try {
    const count = await Photo.countDocuments({
      user_id: req.params.id,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/commentCount/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const photos = await Photo.find({}, "comments");

    let count = 0;

    photos.forEach((photo) => {
      photo.comments?.forEach((cmt) => {
        if (cmt.user_id?.toString() === userId) {
          count++;
        }
      });
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot count comments" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    // chỉ cho sửa chính mình
    if (req.session.userId.toString() !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { first_name, last_name, location, description, occupation } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        first_name,
        last_name,
        location,
        description,
        occupation,
      },
      { new: true } // trả về user đã update
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:id", async (request, response) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }
    response.json(user);
  } catch (error) {
    response.status(500).send(error);
  }
});



module.exports = router;

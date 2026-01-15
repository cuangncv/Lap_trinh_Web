const express = require("express");
const cors = require("cors");
const connectDB = require("./db/dbConnect");
const path = require("path");
const session = require("express-session");
const app = express();

app.set("trust proxy", 1);
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
connectDB();
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");


app.use("/api/images", express.static(path.join(__dirname, "images")));
app.use("/api/user", UserRouter);
app.use("/api/photosOfUser", PhotoRouter);


app.get("/", (req, res) => {
  res.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8080, () => {
  console.log("Server listening on port 8080");
});

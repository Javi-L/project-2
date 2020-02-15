require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

mongoose
  .set("useCreateIndex", true)
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "express-passport-secret",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
app.use(flash());
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public/scss"),
    dest: path.join(__dirname, "public/css"),
    outputStyle: "compressed",
    sourceMap: true,
    prefix: "/css", // reference the destiny of css file
    debug: false
  })
);

require("./passport")(app);

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.errors = req.flash("error");
  next();
});

// Express View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

app.use(express.static(path.join(__dirname, "public")));

// Default value for title local
app.locals.title = "Add a default text";

// Routes
const index = require("./routes/index");
app.use("/", index);

module.exports = app;

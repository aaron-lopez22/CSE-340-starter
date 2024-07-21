const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const path = require("path");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const staticRoutes = require("./routes/static");
const utilities = require('./utilities/');
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); // Ensure jwt is required

const app = express();

// Body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(expressLayouts);
app.use(cookieParser());

// Middleware for session handling
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        createTableIfMissing: true,
        pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: 'sessionId',
}));

app.use(flash());

// Express Messages Middleware
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(async (req, res, next) => {
    res.locals.nav = await utilities.getNav();
    next();
});

// Middleware to check JWT token and set login status
app.use((req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.clearCookie("jwt");
                res.locals.loggedin = false;
            } else {
                res.locals.loggedin = true;
                res.locals.accountData = decoded;
            }
            next();
        });
    } else {
        res.locals.loggedin = false;
        next();
    }
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");

app.use("/", staticRoutes);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

app.get("/", utilities.handleErrors(baseController.buildHome));
app.get("/test", (req, res) => {
    res.render("test", { title: "Test Page" });
});

app.use(async (req, res, next) => {
    next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// Improved error handling middleware in server.js
app.use(async (err, req, res, next) => {
    let nav = await utilities.getNav();
    console.error(`Error at: "${req.originalUrl}": ${err.message}`);
    const message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
    res.status(err.status || 500).render("errors/error", {
        title: err.status || 'Server Error',
        message,
        nav
    });
});

app.use(async (req, res, next) => {
    res.locals.nav = await utilities.getNav();
    next();
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
    console.log(`app listening on ${host}:${port}`);
});
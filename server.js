/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

app.use(express.static('public'))
app.use(expressLayouts)
app.use(static)

/* ***********************
 * View Engines and Templates
 *************************/
//index route
app.set("view engine", "ejs")
app.set("layout", "./layouts/layout") // not at views root
app.get("/", baseController.buildHome)
app.get("/", function(req, res){
  res.render("index", {title: "Home"})
})
app.use("/inv", inventoryRoute)



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

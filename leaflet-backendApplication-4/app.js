const express = require("express");
const dotenv = require("dotenv"); //to load environment variables
const app = express();
const {Client} = require("pg"); //postgresql client to connect to postgresql database

app.set("view engine", "ejs"); //set view engine to ejs which is embedded javascript templating

app.use(express.urlencoded({ extended: "true" })); //to parse urlencoded bodies
app.use(express.json()); //to parse json bodies
const path = require("path");
dotenv.config({ path: "./.env" }); //load environment variables from .env file

const server_port = process.env.SERVER_PORT;

const publicDir = path.join(__dirname, "./public"); //set static folder i.e. where static files like css, js, images will be stored
app.use(express.static(publicDir)); //use static folder


//create a new postgresql client using environment variables
const db = new Client ({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   port: process.env.DATABASE_PORT,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE,
 });
//connect to the postgresql database
db.connect()
.then(()=>
    console.log("connected to postgresql geospatial db")

)
//get the home route
app.get("/", async (req, res) => {
    res.render("index");
});
//start the server
app.listen(server_port, () => {
  console.log(`server started on port ${server_port}`);
});
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const {Client} = require("pg");


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: "true" }));
app.use(express.json());
// other imports
const path = require("path");
dotenv.config({ path: "./.env" });

const server_port = process.env.SERVER_PORT;

const publicDir = path.join(__dirname, "./public");
app.use(express.static(publicDir));


const db = new Client ({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   port: process.env.DATABASE_PORT,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE,
 });

db.connect()
.then(()=>
    console.log("connected to postgresql geospatial db")

)

app.get("/", async (req, res) => {
    res.render("index");
});

app.listen(server_port, () => {
  console.log(`server started on port ${server_port}`);
});
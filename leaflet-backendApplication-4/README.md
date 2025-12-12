## 🎬 Episode 4: Integrating Leaflet.js with Node.js & PostgreSQL

_This episode covers:_

- Drawing, editing and deleting shapes on the map (Draw plugin)
- Refactoring the architecture to build a **full-stack application** (with `app.js` for backend/frontend communication)
- Integrating **EJS** as the view engine for dynamic rendering
- Setting up and connecting to a **PostgreSQL database** in preparation for future data storage



## 📂 Leaflet Plugins

1.  **Draw** : https://github.com/Leaflet/Leaflet.draw


**▶️ Run the Demo (Windows)**
- Clone the repo<br />
- Install Node.js and npm if you haven't already<br />
_You can use a Node installer to install both Node.js and npm on your system: https://nodejs.org/en/download/ _<br />
- Install Postgresql if you haven't already & create a database. IMPORTANT!: write down your password asked during installation<br />
- Navigate to the folder that contains the code<br />
- Create a .env file and add inside: <br />
```
SERVER_PORT=5004
DATABASE_HOST = localhost
DATABASE_USER = postgres
DATABASE_PORT = 5432
DATABASE_PASSWORD = your-password-during-installation
DATABASE = your-database-name
```
- run npm i to install all the modules (npm should be installed)<br />
- run npm start<br />
- Open a browser and type http://localhost:5004/
- **break things!** <br />

_Feel free to use the hashtag **#webGISonSundays** to share your own experiments !_
-------------------------------------------
🧠 Insights into the Code

In this episode we added leaflet's Draw plugin was added, some capabilities and methods of this plugin were explored and the architecture of the project changed to serve as a backend-front end architecture by using Node.js + EJS view engine

### 📄 index.html becomes index.ejs

-Links to Leaflet CSS & JS
-Links to MinMap, Geocoder, Leaflet-Compass & Draw Plugins CSS & JS
-Contains a div with an id = "map" where the map will be rendered

### 🎨 styles.css

- Sets the height/width for the map container<br />
_*Leaflet requires this; otherwise, the map will not appear_
- Apply custom styles to pop ups

### 📘 index.js — The Core Logic

This is where all WebGIS logic lives:<br />
    ✔ Map creation<br />
    ✔ Basemap loading<br />
    ✔ Styling<br />
    ✔ Loading GeoJSON layers<br />
    ✔ Fetcing external data<br />
    ✔ Initializing plugins<br />
    ✔ Popups<br />
    ✔ Basemap Change Detection<br />
    ✔ Coordinates Detection<br />

### 📘 app.js — The application
    ✔ Enables the backend - front end communication<br />
    ✔ Sets the view engine to pass parameters from the backend to the front end<br />
    ✔ Holds the logic to communicate to a database<br />


**index.js**
_Please refer to the READMEs of Previous Episodes for Previous Code Blocks_

1️⃣ Initializing the Draw Plugin <br />

```
  //Leaflet draw plugin
  var drawnFeatures = new L.FeatureGroup();
  map.addLayer(drawnFeatures);

  var drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnFeatures,
      // remove: false --->uncomment to disable the delete button
    }
  });

map.addControl(drawControl);
```


2️⃣ Adding pop ups with area, lat/long, distance or center/radius to the created shapes <br />
_This block of code derived from: from https://github.com/Leaflet/Leaflet.draw/blob/develop/docs/examples/popup.html
```
        // Truncate value based on number of decimals
        var _round = function(num, len) {
            return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
        };
        // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
        var strLatLng = function(latlng) {
            return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
        };

        // Generate popup content based on layer type
        // - Returns HTML string, or null if unknown object
        var getPopupContent = function(layer) {
            // Marker - add lat/long
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                return strLatLng(layer.getLatLng());
            // Circle - lat/long, radius
            } else if (layer instanceof L.Circle) {
                var center = layer.getLatLng(),
                    radius = layer.getRadius();
                return "Center: "+strLatLng(center)+"<br />"
                      +"Radius: "+_round(radius, 2)+" m";
            // Rectangle/Polygon - area
            } else if (layer instanceof L.Polygon) {
                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    area = L.GeometryUtil.geodesicArea(latlngs);
                return "Area: "+L.GeometryUtil.readableArea(area, true);
            // Polyline - distance
            } else if (layer instanceof L.Polyline) {
                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    distance = 0;
                if (latlngs.length < 2) {
                    return "Distance: N/A";
                } else {
                    for (var i = 0; i < latlngs.length-1; i++) {
                        distance += latlngs[i].distanceTo(latlngs[i+1]);
                    }
                    return "Distance: "+_round(distance, 2)+" m";
                }
            }
            return null;
        };


```

3️⃣ Exploring draw's events <br />
_See a list of events here: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#l-draw-event-draw:created 
- draw:created. Triggered when a new vector or marker has been created.
```
  map.on("draw:created", function (e) {
    var layer = e.layer;
    var type = e.layerType;
    var content = getPopupContent(layer); //calling thre custom function
    console.log("DRAW CREATED");
    console.log(type);
    console.log(layer);
    console.log(layer.toGeoJSON());

    if (content !== null) {
      layer.bindPopup(content);
        }    
    // You can add custom logic here based on the type of shape drawn
    drawnFeatures.addLayer(layer);

  });
```
- draw:drawstop. Triggered when the user has finished a particular vector or marker.
```
map.on("draw:drawstop", function (e) {
    console.log("Drawing Stopped");
    console.log(e); 

});
```
- draw:edited.  Triggered when layers in the FeatureGroup (`var drawnFeatures = new L.FeatureGroup();`) have been edited and saved.

```
map.on("draw:edited", function (e) {
    var layers = e.layers;
    console.log(e);
    content = null;
    layers.eachLayer(function(layer) {
        console.log(layer);
        console.log(layer.toGeoJSON());
        content = getPopupContent(layer);
        if (content !== null) {
            layer.setPopupContent(content);
        }        
   
    });
  });
```

- draw:deleted.  Triggered when layers have been removed (**and saved**) from the FeatureGroup.

```
map.on("draw:deleted", function (e) {
  const layers = e.layers;

  layers.eachLayer(layer => {
    console.log("Deleted layer:", layer);
    // Optional: do something with it, e.g., remove from an array
    // allLayers = allLayers.filter(l => l !== layer);
  });
 });
```
- draw:drawstart.Triggered when the user has chosen to draw a particular vector or marker.

```
 map.on("draw:drawstart", function (e) {
  
  console.log("Drawing Started");
 });
```
-------------------------------------------
**app.js**
- `const express = require("express");`: Imports the Express library from the installed node modules. Express is a minimalist web framework for Node.js that simplifies creating HTTP servers, routing, middleware, etc.
- `const dotenv = require("dotenv");` : Imports the dotenv library, which loads environment variables from a .env file into process.env. This lets you keep secrets (like database URLs, API keys) out of your source code enchacing the overall security of your application.
- `const app = express();`. Creates an Express application instance. `app` is your main server object where you define routes, attach middleware, set configuration, and start the server
- `const {Client} = require("pg");`: Imports the Client class from the pg (node‑postgres) library for connecting to a PostgreSQL database.
- `app.set("view engine", "ejs");`: Configures the view engine to EJS (Embedded JavaScript templates).
- `app.use(express.urlencoded({ extended: "true" }));`: Registers middleware to parse URL‑encoded request bodies
- `app.use(express.json());`: Registers middleware to parse JSON request bodies
- `const path = require("path");`: Imports Node’s built‑in path module for handling filesystem paths
-`dotenv.config({ path: "./.env" });`: Loads variables from the .env file at the given path into process.env.
- `const publicDir = path.join(__dirname, "./public") `: Builds an absolute path to your public folder.
- `app.use(express.static(publicDir))`: Registers middleware that maps incoming requests to files in that folder
- Create a new postgresql client using environment variables:<br />
```const db = new Client ({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   port: process.env.DATABASE_PORT,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE,
 });

```
- Connect to the postgresql database<br />
```
db.connect()
.then(()=>
    console.log("connected to postgresql geospatial db")

)
```
- `app.get("/", async (req, res) => {res.render("index");});`: Registers a route handler for HTTP GET requests to the root URL (/). When visiting your site’s homepage (e.g., http://localhost:3000/), this handler runs
- Starts the HTTP server and begins listening for incoming connections on the given port (server_port):
```
app.listen(server_port, () => {
  console.log(`server started on port ${server_port}`);
});
```

🔗 Usefull links

1. Leaflet Draw (source files)<br/>
https://github.com/Leaflet/Leaflet.draw/tree/develop
2. Leaflet Draw (documentation)<br/>
https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
3. Leaflet Draw popup example <br/>
https://github.com/Leaflet/Leaflet.draw/blob/develop/docs/examples/popup.html
4. Node installer<br/>
https://nodejs.org/en/download/
5. PostgreSQL Downloads<br/>
https://www.postgresql.org/download/

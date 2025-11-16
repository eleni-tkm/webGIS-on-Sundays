## 🎬 Episode 1: From QGIS to Leaflet.js (Part 1)

_This episode covers:_

- Create a point vector layer in QGIS
-  Export and explore the GeoJSON format
-  Use the Fetch API to load GeoJSON data
- Explore & Utilize Leaflet's map object

**Leaflet.js** is a client side tool used to create interactive maps accesible from a broswer

**QGIS** is a typical open-source GIS software used to work with geospatial data. 

_You can download QGIS here: https://qgis.org/download/_

## 📂 Create data for this code
You can use the existing data in the data folder that includes the three common vector data:
- points (points-seih-sou.geojson)
- lines (lines.geojson)
- polygon (polygon-seih-sou.geojson)

**✏️ if you want to make your own data**:
- Open QGIS and add a basemap
- Create a new vector layer and choose the geometry that you want (point, line or polygon)
- Include a field to hold a description for your data (here called 'descr')
- Set CRS to **WGS84 (EPSG:4326)**
- Export your data in geojson format in the 'data' folder

**▶️ Run the Demo (Windows)**
-clone the repo
-open cmd and navigate to the folder that contains the code
-run python -m http.server 8000 (you should have python installed)
-type localhost:8000 in a browser
-to free the post and kill the server hit ctrl+C

-------------------------------------------

🧠 Insights into the Code

This episode contains three essential files that work together to display GeoJSON data on a Leaflet map

### 📄 index.html

-Links to Leaflet CSS & JS
-Contains a div with an id = "map" where the map will be rendered

### 🎨 styles.css

-Sets the height/width for the map container
_*Leaflet requires this; otherwise, the map will not appear_

### 📘 index.js — The Core Logic

This is where all WebGIS logic lives:
    ✔ Map creation
    ✔ Basemap loading
    ✔ Styling
    ✔ Loading GeoJSON layers
    ✔ Popups

**It includes:**

1️⃣ Map Initialization
`var map = L.map('map').setView([40.635421751302594, 23.048999069281344], 13);`
.setView([lat, lng], zoom) defines the initial map position & the zoom level
💡 Find your location on Google Maps and place it into the setView
💡 see: https://leafletjs.com/examples/quick-start/


2️⃣ Basemap
```
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
```
💡 Explore other basemaps options: https://leafletjs.com/plugins.html#basemap-providers

3️⃣ Define Styles for Each Geometry Type
var pointStyle = { ... };
var lineStyle = { ... };
var polygonStyle = { ... };

💡 Play with styling



4️⃣ Load the POLYGON Layer

- fetch() loads the file
- Response is converted to JSON
- L.geoJSON adds the polygon to the map using your style

```
fetch('data/polygon-seih-sou.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, { style: polygonStyle }).addTo(map);
  });
```


5️⃣ Load the LINE Layer

Same logic — different style:

```
fetch('data/lines.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, { style: lineStyle }).addTo(map);
  });
```

Same logic — different style

6️⃣ Load the POINT Layer + Popups
- pointToLayer converts points into circle markers
- onEachFeature connects each feature’s descr attribute to a popup
- layer.bindPopup takes the input and add it as content of the popup

fetch('data/points-seih-sou.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, pointStyle),

      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.descr) {
          layer.bindPopup(feature.properties.descr);
        }
      }
    }).addTo(map);
  });

💡 Can you find a way to change the style of the popups ❓❓❓

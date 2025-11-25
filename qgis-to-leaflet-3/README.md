## 🎬 Episode 2: From QGIS to Leaflet.js (Part 2) --> Extenting Interactivity

_This episode covers:_

- Adding multiple basemaps (providers) to the map
- Organizing basemaps to switch between them
- Detecting changes in the basemap
- Detecting the coordinates we click on
- Using our first Leaflet plugin (MiniMap)
- Using simple JavaScript to update our MiniMap (reflect changes on our basemap)
- Customizing the styles of popups

## 📂 How to use the MiniMap plugin

1. Download the logic (the Control.MiniMap.js file), the styling ( Control.MiniMap.css file), and the images from here: https://github.com/Norkart/Leaflet-MiniMap/tree/master/src. These resources **are already included** in this repository
2. Into the `<head>` tag of the index.html, add:<br/> 
`<link rel="stylesheet" href="plugins/Control.MiniMap.css"/>`<br/>
 This links to the plugin's CSS file.
3. At the end of the `<body>` tag of the index.html file, add:
 `<script src="plugins/Control.MiniMap.js" type="text/javascript"></script>` <br/>
 This links to the plugin's JavaScript logic.
4. You're now ready to use the plugin!

**▶️ Run the Demo (Windows)**
- clone the repo<br />
- open cmd and navigate to the folder that contains the code<br />
- run python -m http.server 8000 (you should have python installed)<br />
- type localhost:8000 in a browser<br />
- to free the post and kill the server hit ctrl+C<br />
- **break things!** <br />

_Feel free to use the hashtag **#webGISonSundays** to share your own experiments !_
-------------------------------------------

🧠 Insights into the Code

In this episode we added a new folder called 'plugins' to store the styles, logic, and other resources (e.g., images) for the MiniMap plugin.<br />
In future episodes, we'll store additional plugins in this folder.

### 📄 index.html

-Links to Leaflet CSS & JS
-Links to MinMap CSS & JS
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
    ✔ Popups<br />
    ✔ Basemap Change Detection<br />
    ✔ Coordinates Detection<br />

**It includes:**
_Please refer to the README of Episode 1 for previous code blocks_

1️⃣ Adding Multiple Basemap Providers <br />
- We create multiple variables for the basemap providers
- We store all providers in a variable called `baseMaps`
- We add the providers to the map using the `L.control.layers` method

```
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'});


var sattelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri'
});

var baseMaps = {
    "OpenStreetMap": osm,
    "OpenStreetMap.HOT": osmHOT,
    "Sattelite" : sattelite
};

var layerControl = L.control.layers(baseMaps).addTo(map);
```

With this line: <br /> 
`var layerControl = L.control.layers(baseMaps).addTo(map);` <br />
we add the L.control.layers to the map. This gives users the ability to switch between different basemaps and toggle overlays on/off. The basemaps will be switched using radio buttons  <br />

💡 Can you change the position of the layer control **from top-right to bottom-right** ❓❓❓
💡 Can you organize the **data** using the Control.Layers ❓❓❓---> see https://leafletjs.com/reference.html#control-layers

2️⃣ Detecting Basemap Changes and Click Coordinates<br />
- baselayerchange is an event that is fired when the base layer is changed through the layers control (`var layerControl`)
- click is an event that is fired when the user clicks (or taps) the map

_From: https://leafletjs.com/reference.html_<br />
_see https://leafletjs.com/reference.html#map-baselayerchange & https://leafletjs.com/reference.html#map-click_

```
//Detect basemap Change
map.on('baselayerchange', function(e) {
    console.log('Base layer changed to:', e.name);
    console.log(e);
 
});

//see the coordinates that you are clicking on!
map.on('click', function(e) {
    
    console.log('lat:', e.latlng.lat);
    console.log('lng:', e.latlng.lng);
 
});
```

3️⃣ Providers for MiniMap plugin<br />
- We create copies of the basemap providers we used earlier but store them in new variables, adding the prefix 2 (e.g., `osm` becomes `osm2`). <br />
This is necessary because the plugin's creator recommends not reusing the layer added to the main map
_See more details here: https://github.com/Norkart/Leaflet-MiniMap_
<br />
We then use one of the new provider layers (e.g., `osm2`) for the MiniMap.

```
// MiniMap see https://github.com/Norkart/Leaflet-MiniMap we need to create new var for our layers
var osm2 = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 0,
      maxZoom: 13,
      attribution: '© OpenStreetMap'
    });

var osmHOT2 = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'});


var sattelite2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri'
});

//add minimap to map
var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);
```
4️⃣ Uaing **baselayerchange** with **changeLayer**
The `baselayerchange` event in Leaflet lets us detect when the basemap is changed. We can use this event to update the MiniMap accordingly using the `changeLayer` method from the MiniMap plugin.

_see https://github.com/Norkart/Leaflet-MiniMap?tab=readme-ov-file#available-methods_

```
//change minimap based on baselayer changes
map.on('baselayerchange', function(e) {
    switch (e.name) {
      case 'OpenStreetMap':
        miniMap.changeLayer(osm2);
        break;
      case 'OpenStreetMap.HOT':
        miniMap.changeLayer(osmHOT2);
        break;
      case 'Sattelite':
        miniMap.changeLayer(sattelite2);
        break;
    }
    console.log('Base layer changed to:', e.name);
    console.log(e);
 
});
```

🔗 Usefull links

1. Leaflet MiniMap Plugin (source files)<br/>
https://github.com/Norkart/Leaflet-MiniMap/tree/master/src
2. Leaflet MiniMap Plugin (main repo)<br/>
https://github.com/Norkart/Leaflet-MiniMap
3. Leaflet MiniMap Plugin — Available Methods<br/>
https://github.com/Norkart/Leaflet-MiniMap?tab=readme-ov-file#available-methods
4. Leaflet MiniMap Example<br/>
https://github.com/Norkart/Leaflet-MiniMap/blob/master/example/example.html
5. Leaflet Documentation — Control.Layers <br/>
https://leafletjs.com/reference.html#control-layers
6. Leaflet Documentation — baselayerchange event<br/>
https://leafletjs.com/reference.html#map-baselayerchange
7. Leaflet Documentation — click event<br/>
https://leafletjs.com/reference.html#map-click
8. Leaflet Basemap Switcher Example<br/>
https://leafletjs.com/examples/layers-control/

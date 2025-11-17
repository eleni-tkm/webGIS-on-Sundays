//open cmd
// cd to your directory and then type python3 -m http.server 8000
//on a browser type http://localhost:8000/ to see the results

//see https://leafletjs.com/examples/quick-start/
var map = L.map('map').setView([40.635421751302594, 23.048999069281344], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//you can play with styling here
//style for points
//see https://leafletjs.com/examples/geojson/
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//style for lines
var LineStyle = {
    "color": "#10532aff",
    "weight": 5
};
//style for polygon
var PolygonStyle = {
    "color": "#d423a8a9",
    "weight": 5,
    "opacity": 0.65
};

//-----------------------code in Episode 2-----------------------------------

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

//Detect basemap Change
map.on('baselayerchange', function(e) {
    console.log('Base layer changed to:', e.name);
    console.log(e);
 
});

map.on('click', function(e) {
    
    console.log('lat:', e.latlng.lat);
    console.log('lng:', e.latlng.lng);
 
});


// MiniMap
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

var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);

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

//-----------------------End of code in Episode 2-----------------------------------

fetch('data/polygon-seih-sou.geojson')
  .then(res => res.json())
  .then(geojson => {
    // Add the GeoJSON layer to the map
    L.geoJSON(geojson, {
       style: PolygonStyle
    }).addTo(map);
  });


//the order in which layers are added matters. If you put points first you won't be able to see their pop up because it 
//will be covered by the others layers
//we will add pop up in the next episode

  fetch('data/lines.geojson') //see https://www.w3schools.com/jsref/api_fetch.asp
  .then(res => res.json())
  .then(geojson => {
    // Add the GeoJSON layer to the map
    L.geoJSON(geojson, {
       style: LineStyle
    }).addTo(map);
  });

//alternative from  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// async function getData() {
//   const url = "data/lines.geojson";
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Response status: ${response.status}`);
//     }

//     const ResultPoints = await response.json();
//     console.log(ResultPoints);
//     L.geoJSON(ResultPoints, {
//        style: LineStyle
//     }).addTo(map);
//   } catch (error) {
//     console.error(error.message);
//   }
// }

// getData();
  
fetch('data/points-seih-sou.geojson')
  .then(res => res.json())
  .then(geojson => {
    // Add the GeoJSON layer to the map
    L.geoJSON(geojson, {
          pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions) //see https://leafletjs.com/examples/geojson/
    },
        onEachFeature: function(feature, layer) {
    // does this feature have a property named popupContent (which could be the description)?
    //see https://leafletjs.com/reference.html#geojson-option
        if (feature.properties && feature.properties.descr) {
            layer.bindPopup(feature.properties.descr);
        }
    }
}).addTo(map);
});


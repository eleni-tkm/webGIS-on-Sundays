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

//see the coordinates that you are clicking on!
map.on('click', function(e) {
    // map.setView([e.latlng.lat, e.latlng.lng], 13)
    // L.marker([e.latlng.lat, e.latlng.lng]).bindPopup("You clicked the map at " + e.latlng).openPopup().addTo(map);
   
    console.log('lat:', e.latlng.lat);
    console.log('lng:', e.latlng.lng);
 
});


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

//add Geocoder
L.Control.geocoder({
    defaultMarkGeocode: false //set to false or else it will overwrite the animation cause by the flyTo method used below
})
.on('markgeocode', function(e) {
    var latlng = e.geocode.center;
    //console.log(e.geocode);

    //flyTo --> from https://gis.stackexchange.com/questions/168687/fly-to-location-in-leaflet
    map.flyTo(latlng, 14, {
        animate: true,
        duration: 4
    });

  
    // Wait for the flyTo animation to finish
    //see https://leafletjs.com/reference.html#map-moveend
    map.once('moveend', function() {
        L.marker(latlng).addTo(map);
    });
})
  
.addTo(map);

//add a compass
var comp = new L.Control.Compass({autoActive: true, showDigit:true});
map.addControl(comp);

//USGS API 
//API documentation: https://earthquake.usgs.gov/fdsnws/event/1/

    // Layer groups for magnitude ranges
    const mag3Layer = L.layerGroup();
    const mag4Layer = L.layerGroup();
    const mag5Layer = L.layerGroup();

    // Add layer control
    // const overlayMaps = {
    //   "Magnitude ≥ 3": mag3Layer,
    //   "Magnitude ≥ 4": mag4Layer,
    //   "Magnitude ≥ 5": mag5Layer
    // };
// L.control.layers({}, overlayMaps).addTo(map); --> If uncomment then you will generate a new layerControl
//instead we will add these layers to the existing layerControl of the basemaps

    
// Add overlays to existing control
    layerControl.addOverlay(mag3Layer, "Magnitude < 3");
    layerControl.addOverlay(mag4Layer, "5 > Magnitude ≥ 3");
    layerControl.addOverlay(mag5Layer, "Magnitude ≥ 5");


    // Add layers to map by default
    mag3Layer.addTo(map);
    mag4Layer.addTo(map);
    mag5Layer.addTo(map);

    //SEE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    let seenIds = new Set();

    function fetchEarthquakes() {
      const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
        'format=geojson&minlatitude=33&maxlatitude=43&minlongitude=18&maxlongitude=30&minmagnitude=2&limit=20000&orderby=time';

      fetch(url)
        .then(res => res.json())
        .then(data => {
          data.features.forEach(eq => {
            const tsunami = eq.properties.tsunami;
            console.log(tsunami);
            console.log(eq.id);
            //SEE https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has
            if (!seenIds.has(eq.id)) {
              seenIds.add(eq.id);
              const [lon, lat] = eq.geometry.coordinates;
              const mag = eq.properties.mag;
              const place = eq.properties.place;
              const time = new Date(eq.properties.time).toLocaleString();
              
              
              let stunamiValue;
              if (tsunami == 0) {
                stunamiValue = "False";
              } else {
                stunamiValue = "True";
              }
              const marker = L.circleMarker([lat, lon], {
                radius: mag * 1.5,
                color: mag >= 5 ? 'red' : mag < 5 ? 'orange' : 'yellow'
              }).bindPopup(`
                <b>${place}</b><br>
                Magnitude: ${mag}<br>
                Date & Time: ${time}<br>
                Tsunami: ${stunamiValue}
              `);

              if (mag >= 5) {
                marker.addTo(mag5Layer);
              } else if (5 > mag && mag >=3) {
                marker.addTo(mag4Layer);
              } else {
                marker.addTo(mag3Layer);
              }
            }
          });
        });
    }

    // Initial load
    fetchEarthquakes();

    // Auto-update every 60 seconds
    setInterval(fetchEarthquakes, 60000);


    //tectonic plates

fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
  .then(res => res.json())
  .then(data => {
    const plateLayer = L.geoJSON(data, {
      onEachFeature: function(feature, layer) {
        // Bind popup with plate name
        const plateName = feature.properties.Name || 'Unknown';
        layer.bindPopup(`<b>Plate Boundary:</b> ${plateName}`);
      }
    }).addTo(map);

    // Add to existing layer control
    layerControl.addOverlay(plateLayer, "Plate Boundaries");

    map.on('baselayerchange', function(e) {
      if (e.name === 'Sattelite') {
        plateLayer.setStyle({
          color: 'yellow',
          weight: 4
        });
      } else {
        plateLayer.setStyle({
          color: 'blue',
          weight: 4
        });
      }
    });
  });

  
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


//from https://leaflet.github.io/Leaflet.draw/docs/examples/popup.html

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

 

  map.on("draw:created", function (e) {
    var layer = e.layer;
    var type = e.layerType;
    var content = getPopupContent(layer);
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

map.on("draw:drawstop", function (e) {
    console.log("Drawing Stopped");
    console.log(e); 

});


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

// map.on(L.Draw.Event.CREATED, function (e) {
//   console.log(e);
//   var type = e.layerType;
//   console.log(type);
//   layer = e.layer;
//   console.log(layer);
//   if (layer.editing.latlngs) {
//     console.log("latlngs here");

    
//   } else {
//     console.log("latlng here");
//   }
//        // Do marker specific actions

//    // Do whatever else you need to. (save to db; add to map etc)
//    map.addLayer(layer);
// });

//create custom button
map.on("draw:deleted", function (e) {
  const layers = e.layers;

  layers.eachLayer(layer => {
    console.log("Deleted layer:", layer);
    // Optional: do something with it, e.g., remove from an array
    // allLayers = allLayers.filter(l => l !== layer);
  });
 });

 map.on("draw:drawstart", function (e) {
  
  console.log("Drawing Started");
 });
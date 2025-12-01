## 🎬 Episode 3: Leaflet.js and APIs

_This episode covers:_

- Searching by name/adress or lat/lon (Geocoder plugin)
- Adding a compass (Compass plugin)
- Utilizing the flyTo method
- Utilizing a Map state change event (moveend)
- Adding data from  USGS API endpoint (Earthquake data)
- Adding tectonic plate boundaries from an external source (static file hosted on GitHub)


## 📂 Leaflet Plugins

1.  **Geocoder** : https://github.com/perliedman/leaflet-control-geocoder
2. **Compass** : https://github.com/stefanocudini/leaflet-compass

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

In this episode we added two more leaflet plugins, utilized a new leaflet method and a map state event and add data from external sources on the map

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
    ✔ Fetcing external data<br />
    ✔ Initializing plugins<br />
    ✔ Popups<br />
    ✔ Basemap Change Detection<br />
    ✔ Coordinates Detection<br />

**It includes:**
_Please refer to the README of Episode 1 & Episode 2 for previous code blocks_

1️⃣ Initializing & Customizing the Geocoder Plugin <br />
- We initialize the plugin using `L.Control.geocoder`
- We remove the control's default handler for marking a result with `defaultMarkGeocode: false`<br />
_We are doing this because if it is true it will overwrite the .flyTo function_
- We use a variable to store the center of the area that has been searched:  `var latlng = e.geocode.center;`
- We use the `flyTo` method and passing the `var latlng = e.geocode.center;` as a parameter
- We use the `moveend` Map state change event to detect the end of the flyTo animation and add a marker using the `L.marker` and passing the  `var latlng = e.geocode.center;`

```
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
```


2️⃣ Using USGS's API endpoint: https://earthquake.usgs.gov/fdsnws/event/1/ <br />
_For more details please see: https://earthquake.usgs.gov/fdsnws/event/1/_
- We create the constants mag[i]Layer to store the multiple erathquake epicenters per magnitude <br />
_Where i is the erathquake's magnitude_
- To each of these groups we add an overlay (checkbox entry) with the given name to the control `layerControl` the we previously created for the basemaps using the `.addOverlay`
- We add the groups and their checkboxes to the map (for now they are empty)
- We create a new object using `Set` to monitor an event's (i.e.,earthquake) id. A value in the set may only occur once.
- We create a function `function fetchEarthquakes()` to fetch the data from USGS's API, store their properties and use these properties to:
  - add markers of specific color based on the magnitudes
  - create popups and
  - add the markers on a specific group based on an earthquake's magnitude
- Finally we set an interval of 60 seconds and we call the function again to add new data -if any-. The new data is detected in this line `if (!seenIds.has(eq.id))` where basically we check all the available data to see if there is a new event with an id that is not in our `Set` object
```
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
                radius: mag * 2,
                color: mag >= 5 ? 'red' : mag >= 4 ? 'orange' : 'yellow'
              }).bindPopup(`
                <b>${place}</b><br>
                Magnitude: ${mag}<br>
                Date & Time: ${time}<br>
                Tsunami: ${stunamiValue}
              `);

              if (mag >= 5) {
                marker.addTo(mag5Layer);
              } else if (mag >= 4) {
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

```

3️⃣ Fetching data from an external source (Tectonic Plates Boundaries)<br />
- We fetch data from here: https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json. This URL provides a raw GeoJSON static file with the boundaries (and other properties) of the tectonic plates <br />
- Because the data is in GeoJSON format, we use the `L.geoJSON` to add them on the map
- We customize the tectonic plates boundaries
- We bind a popup to the lines (boundaries) that holds each pair of the tectonic plates
```
//tectonic plates

fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
  .then(res => res.json())
  .then(data => {
    const plateLayer = L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 4
      },
      onEachFeature: function(feature, layer) {
        // Bind popup with plate name
        const plateName = feature.properties.Name || 'Unknown';
        layer.bindPopup(`<b>Plate Boundary:</b> ${plateName}`);
      }
    }).addTo(map);

    // Add to existing layer control
    layerControl.addOverlay(plateLayer, "Plate Boundaries");
  });
```


🔗 Usefull links

1. Leaflet Geocoder Plugin (source files)<br/>
https://github.com/perliedman/leaflet-control-geocoder
2. Leaflet Compass Plugin (source files)<br/>
https://github.com/stefanocudini/leaflet-compass
3. Leaflet .flyTo method <br/>
https://leafletjs.com/reference.html#map-flyto
4. Tectonic Plates raw Geojson file<br/>
https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json
5. Leaflet moveend Event<br/>
https://leafletjs.com/reference.html#map-moveend
6. Leaflet LayerGroup<br/>
https://leafletjs.com/reference.html#layergroup
7. USGS: API Documentation - Earthquake Catalog<br/>
https://earthquake.usgs.gov/fdsnws/event/1/
8. JavaScript: The Set Object<br />
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
9. JavaScript: The .has() method<br />
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has

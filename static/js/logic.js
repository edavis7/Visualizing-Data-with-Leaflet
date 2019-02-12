// Store our API endpoint inside queryUrl
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// uncomment for quakes in the last hour
// queryUrl = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  // console.log(data.features)
  var mag = data.features.map(feature => {
    return {
      name: feature.properties.place,
      location: [
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1]
      ],
      points: feature.properties.mag
    };
  });

  createFeatures(data.features);

  // Loop through the cities array and create one marker for each city object
  function colorMarker(mag) {
    // Conditionals for countries points
    var color = "mag";
    if (mag > 5) {
      return "#F06B6B";
    } else if (mag > 4.1) {
      return "#F0A76B";
    } else if (mag > 3.1) {
      return "#F3BA4E";
    } else if (mag > 2.1) {
      return "#F3DB4E";
    } else if (mag > 1.1) {
      return "#E1F34C";
    } else {
      return "#B7F34D";
    }
  }

  function markerSize(mag) {
    return mag * 4;
  }

  // .bindPopup("<h1>" + mag[i].name + "</h1> <hr> <h3>Points: " + mag[i].points + "</h3>").addTo(myMap);

  function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup(
        "<h3>" +
          feature.properties.place +
          "</h3><hr><p>" +
          new Date(feature.properties.time) +
          "</h3><hr></p>" +
          "<p>Magitude:</p>" +
          feature.properties.mag
      );
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,

      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          fillOpacity: 1,
          // color: colorMarker(feature.properties.mag),
          fillColor: colorMarker(feature.properties.mag),
          weight: 0.5,
          radius: markerSize(feature.properties.mag)
        });
      }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

  function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
      }
    );

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });

    // Create legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend"),
        mag = [0, 1, 2, 3, 4, 5],
        labels = [];

      div.innerHTML += "<b>Magitude</b><br>";

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < mag.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          colorMarker(mag[i] + 1) +
          '"></i> ' +
          mag[i] +
          (mag[i + 1] ? "&ndash;" + mag[i + 1] + "<br>" : "+");
      }

      return div;
    };

    legend.addTo(myMap);
  }

  // Create a layer control
  // Pass in our legend and overlayMaps
  // Add the layer control to the map
  L.control
    .layers(legend, overlayMaps, {
      collapsed: false
    })
    .addTo(myMap);
});

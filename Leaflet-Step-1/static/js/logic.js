// url for USGS - All Earthquakes from the Past 7 Days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// function to return circle radius based on earthquake magnitude
function marker_size(magnitude) {
    return magnitude * 3;
}

// function to return circle fill color based on earthquake magnitude
function marker_color(magnitude) {
    if (magnitude > 5) {
        return "#ff5900";
    } else if (magnitude > 4) {
        return "#ff8c00";
    } else if (magnitude > 3) {
        return "#ffb700";
    } else if (magnitude > 2) {
        return "#ffdd00";
    } else if (magnitude > 1) {
        return "#ccff00";
    } else {
        return "#95ff00";
    }
}

// Get data from url in json format and calls createFeatures function 
d3.json(url, function(earthquakeData) {
    createFeatures(earthquakeData.features);
});

// createFeatures function uses geojson functions "onEachFeature" and  "pointToLayer" 
// refernces :https://leafletjs.com/examples/geojson/
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {

        // onEachFeature option is used to attach a popup on features when they are clicked.
        onEachFeature: function(feature, layer) {

            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>Date & Time: " + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " + feature.properties.mag + "</p>")
        },
        // pointToLayer function uses a LatLng and returns an instance of the CircleMarker
        // radius of the circle and fill color is determined by marker_size and marker_color functions
        pointToLayer: function(feature, latlng) {
            return new L.circleMarker(latlng, {
                radius: marker_size(feature.properties.mag),
                fillColor: marker_color(feature.properties.mag),
                fillOpacity: 1,
                stroke: false,
            })
        }
    });
    // call createMap function
    createMap(earthquakes);
}

// createMap function with Map layers specifications
function createMap(earthquakes) {

    // satellite map
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    // light map
    var Grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    // outdoor map
    var Outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Define baseMaps object to hold base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Grayscale": Grayscalemap,
        "Outdoors": Outdoorsmap
    };

    // overlay object to hold overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map with a center on USA coordinates
    var myMap = L.map("map", {
        center: [37.0902, -95.7129],
        zoom: 3,
        layers: [satellitemap, earthquakes]
    });


    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // legend position
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < magnitudes.length; i++) {

            // legend text formation
            if (magnitudes[i + 1] > 0) {
                var magnitude_text = `${magnitudes[i]} - ${magnitudes[i + 1] }`
            } else {
                var magnitude_text = `${magnitudes[i]} +`
            }
            // legend color and text
            div.innerHTML +=
                '<i style="background-color:' + marker_color(magnitudes[i] + 1) + '"></i> ' + magnitude_text + '<br>';
        }
        return div;
    };
    // add legend to map
    legend.addTo(myMap);
}
// Store the API inside Url and PlatesUrl 
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var PlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//pull data for earthquakes
d3.json(Url, function(data) {
    // console.log(data.features);
    tectonicPlates(data.features);
});

//pull data for tectonic plates
function tectonicPlates(platesData) {
    d3.json(PlatesUrl, function(data) {
        
        createFeatures(platesData, data.features);
    });
}

//magnitude of the earthquake by color 
function getColor(magnitude) {
    return magnitude >= 5 ? '#e80909' :
           magnitude >= 4  ? '#e87909' :
           magnitude >= 3  ? '#ffe208' :
           magnitude >= 2  ? '#f0ff19' :
           magnitude >= 1   ? '#5ce330' :
                      '#03ff3d';
}


// Reflect the magnitude of the earthquake in size 
function magnitudeSize(magnitude) {
    return magnitude * 40000;
};

// Create Features
function createFeatures(earthquakeData, rockData) {

    //display place and magnitude of earthquake in a popup
    function onFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</p><hr><p>" + "<h3>Magnitude: " + feature.properties.mag + "</h3>")

    };
    //Create a GeoJSON layer containing the earthquakeData 
    var earthquakes = L.geoJSON(earthquakeData, {

        onEachFeature: onFeature,

        pointToLayer: function(feature, latlng) {
            return L.circle(latlng, {
                radius: magnitudeSize(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: 0.5,
                color: "#000000",
                weight: 0.5
            })
        }

    });


    // Create a GeoJSON layer containing the rockData
    var faultLines = L.geoJson(rockData, {
        style: function(feature) {
            var latlngs = (feature.geometry.coordinates);
            return L.polyline(latlngs);
        }
    });

    createMap(earthquakes, faultLines);
};

function createMap(earthquakes, faultLines) {

    // Define satellite and grayscale layers
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
    };

    // Define a overlayMaps object to hold our base layers
    var overlayMaps = {
        Earthquakes: earthquakes,
        FaultLines: faultLines
    };

    // Create a new map
    var myMap = L.map("map", {
        center: [37, -95],
        zoom: 4.5,
        layers: [satellite, grayscale, earthquakes, faultLines]
    });

    //layer control containing baseMaps and the overlaymaps
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);


    //Legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            scale = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < scale.length; i++) {

            div.innerHTML +=
                '<i style="background:' + getColor(scale[i]) + ' "></i> ' +
                scale[i] + (scale[i + 1] ? '&ndash;' + scale[i + 1] + '<br>' : '+');

        }
        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}
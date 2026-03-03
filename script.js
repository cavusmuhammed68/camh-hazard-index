// Create map
var map = L.map('hazardMap').setView([54.5, -1.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{z}/{x}/{y}.png'.replace('{z}/{z}','{z}'), {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let mhiData = {};
let selectedYear = 2021;
let geoLayer;

// Load CSV data
fetch('data/annual_panel_MHI.csv')
.then(response => response.text())
.then(text => {
    const rows = text.split('\n').slice(1);

    rows.forEach(row => {
        const cols = row.split(',');
        const region = cols[0];
        const year = parseInt(cols[1]);
        const mhi = parseFloat(cols[cols.length - 1]);

        if (!mhiData[year]) mhiData[year] = {};
        mhiData[year][region] = mhi;
    });

    loadGeoJSON();
});

function getColor(d) {
    return d > 1  ? '#800026' :
           d > 0.5 ? '#BD0026' :
           d > 0   ? '#E31A1C' :
           d > -0.5 ? '#FC4E2A' :
           d > -1  ? '#FD8D3C' :
                     '#FEB24C';
}

function loadGeoJSON() {
    fetch('data/uk_nuts1.geojson')
    .then(response => response.json())
    .then(geoData => {

        geoLayer = L.geoJson(geoData, {

            filter: function(feature) {
                return feature.properties.NUTS_NAME === "Yorkshire and The Humber"
                    || feature.properties.NUTS_NAME === "North East";
            },

            style: function(feature) {
                const regionName = feature.properties.NUTS_NAME === "North East"
                    ? "Northeast"
                    : "Yorkshire";

                const value = mhiData[selectedYear]?.[regionName] || 0;

                return {
                    fillColor: getColor(value),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            },

            onEachFeature: function(feature, layer) {
                const regionName = feature.properties.NUTS_NAME === "North East"
                    ? "Northeast"
                    : "Yorkshire";

                const value = mhiData[selectedYear]?.[regionName] || "No data";

                layer.bindPopup(
                    "<b>" + feature.properties.NUTS_NAME + "</b><br>" +
                    "Year: " + selectedYear + "<br>" +
                    "MHI: " + value
                );
            }

        }).addTo(map);

    });
}
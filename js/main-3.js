//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())
//2. Import GeoJSON data--done (in getData())
//3. Add circle markers for point features to the map--done (in AJAX callback)
//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value

//1. Create the Leaflet map--done (in createMap())
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 3
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 5;
    //area based on attribute value and scale factor
    var area = Math.abs(attValue) * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};


//calculate a color for each proportional symbol
function calcColor(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 100 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 75 ? '#a6d96a' : // if (d >= 1960) return 'black' else etc…
    attValue >= 50 ? '#ef3b2c' :
    attValue >= 25 ? '#fb6a4a' : // Note that numbers must be in descending order
    attValue >= 10 ? '#fee0d2' : // Note that numbers must be in descending order
    '#fff5f0';
};

function calcColorChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 50 ? '#66bd63' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#a6d96a' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#d9ef8b' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#fdae61' : // Note that numbers must be in descending order
    attValue >= -25 ? '#f46d43' : // Note that numbers must be in descending order
    attValue >= -50 ? '#d73027' : // Note that numbers must be in descending order
    '#67000d';
};


function calcColorPctChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 50 ? '#66bd63' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#a6d96a' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#d9ef8b' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#fdae61' : // Note that numbers must be in descending order
    attValue >= -25 ? '#f46d43' : // Note that numbers must be in descending order
    attValue >= -50 ? '#d73027' : // Note that numbers must be in descending order
    '#67000d';
};

// function for circle markers
function createPropSymbols(data, map, attributes){
    //create marker default options
    var geojsonMarkerOptions = {
        radius: 1,
        fillColor: "#ff7800",
        color: "#000",
        weight: 0.1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //add attribute
    
    var attribute = attributes[0];

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var curVal = Number(feature.properties[attribute]);
            var histAvg = (feature.properties['ppm_1998'] + feature.properties['ppm_1999'] + feature.properties['ppm_2000']) / 3
            var attValue = histAvg - curVal
            //build popup content string
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + feature.properties.Urban_Agglomeration + ", " + feature.properties.Country_or_area + "</p><p><b>" + "PPM 2.5 in " + year + ":</b> " + Number(feature.properties[attribute]).toFixed(1) + "</p>";
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            geojsonMarkerOptions.fillColor = calcColor(attValue);
            //geojsonMarkerOptions.color = calcColor(attValue);
            //console.log(feature.properties.ppm_1999, geojsonMarkerOptions.radius, geojsonMarkerOptions.fillColor);
            //console.log(feature.properties, geojsonMarkerOptions.fillcolor);
             //create circle marker layer
            var layer = L.circleMarker(latlng, geojsonMarkerOptions);
            //bind the popup to the circle marker
            layer.bindPopup(popupContent)
            //return layer;


            //create circle markers
            //return L.circleMarker(latlng, geojsonMarkerOptions)
            return layer;
        }
    }).addTo(map);
};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            //console.log(layer)

            //update each feature's radius based on new attribute values
            var curVal = Number(props[attribute]);
            var histAvg = (props['ppm_1998'] + props['ppm_1999'] + props['ppm_2000']) / 3
            var chgVal = histAvg - curVal
            var radius = calcPropRadius(chgVal);
            layer.setRadius(radius);
            //update color
            var fillColo = calcColor(chgVal);
            layer.setStyle({fillColor:fillColo});
            //console.log(fillColo)
             
            //update popups
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + props.Urban_Agglomeration + ", " + props.Country_or_area + "</p><p><b>" + "PPM 2.5 in " + year + ":</b> " + curVal.toFixed(1) + "</p><p><b>" + "PPM 2.5 historical average:</b> " + histAvg.toFixed(1) + "</p>" + "</p><p><b>Change since historical average:</b> " + chgVal.toFixed(1) + "</p>";
           

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};


// Create Buttons to switch viz type
function selectVizType(map, attributes) {
    //create 3 buttons
    $('#panel2').append('<button class="vis_select" id="ppm" name="ppm" type="button">Measured PPM 2.5</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_change" name="ppm_change" type="button">Change in PPM 2.5 since Baseline (1998-2000)</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_pctChange" name="ppm_pctChange" type="button">% Change in PPM 2.5 since Baseline (1998-2000)</button>')
    // set up listenters so that when clicked, a var will change that will be used in UpdatePropSymbols
    $('.vis_select').click(function(){
        //get the old index value
        var viztype = "ppm_viz"
        if ($(this).attr('id') == 'ppm'){
            viztype = "ppm_viz"
            updatePropSymbols(map, attributes[viztype]);}
         else if ($(this).attr('id') == 'ppm_change'){
            viztype = "ppmChange_viz"
            updatePropSymbols(map, attributes[viztype]);}
         else if ($(this).attr('id') == 'ppm_pctChange'){
            viztype = "ppmPctChange_viz"
            updatePropSymbols(map, attributes[viztype]);}
        console.log(viztype)
    });
}
    

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
   //set slider attributes
    $('.range-slider').attr({
        max: 21,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="reverse">Previous Year</button>');
    $('#panel').append('<button class="skip" id="forward">Next Year</button>');
    //Step 5: click listener for buttons
    //Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 21 ? 0 : index;
            updatePropSymbols(map, attributes[index]);
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 21 : index;
            updatePropSymbols(map, attributes[index]);
        };

        //Step 8: update slider
        $('.range-slider').val(index);
    });
    //click listener for clicking on range
    $('.range-slider').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index]);
        //console.log(index)
    });
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/cities_pop_estimates_Feature.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array
            var attributes = ['ppm_1998','ppm_1999', 'ppm_2000', 'ppm_2001', 'ppm_2002', 'ppm_2003', 'ppm_2004', 'ppm_2005', 'ppm_2006', 'ppm_2007', 'ppm_2008', 'ppm_2009', 'ppm_2010', 'ppm_2011', 'ppm_2012', 'ppm_2013', 'ppm_2014', 'ppm_2015', 'ppm_2016', 'ppm_2017', 'ppm_2018', 'ppm_2019'];
            
            createPropSymbols(response, map,attributes);
            createSequenceControls(map,attributes);
            selectVizType(map,attributes);
        }
    });
};



$(document).ready(createMap);


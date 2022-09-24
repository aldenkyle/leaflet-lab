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
        zoom: 3,
        zoomControl: false
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    //move the zoom control
    L.control.zoom({
    position: 'topleft'
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
    attValue >= 75 ? '#a50f15' : // if (d >= 1960) return 'black' else etc…
    attValue >= 50 ? '#ef3b2c' :
    attValue >= 25 ? '#fb6a4a' : // Note that numbers must be in descending order
    attValue >= 10 ? '#fee0d2' : // Note that numbers must be in descending order
    '#fff5f0';
};

function calcColorChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 50 ? '#d73027' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#f46d43' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#fdae61' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#d9ef8b' : // Note that numbers must be in descending order
    attValue >= -25 ? '#a6d96a' : // Note that numbers must be in descending order
    attValue >= -50 ? '#66bd63' : // Note that numbers must be in descending order
    '#66bd63';
};


function calcColorPctChange(attValue) {
    //scale factor to adjust symbol size evenly
    return attValue >= 50 ? '#67000d' : // Means: if (d >= 1966) return 'green' else…
    attValue >= 25 ? '#d73027' : // if (d >= 1960) return 'black' else etc…
    attValue >= 10 ? '#fdae61' :
    attValue >= 0 ? '#fee08b' : // Note that numbers must be in descending order
    attValue >= -10 ? '#d9ef8b' : // Note that numbers must be in descending order
    attValue >= -25 ? '#a6d96a' : // Note that numbers must be in descending order
    attValue >= -50 ? '#66bd63' : // Note that numbers must be in descending order
    '#66bd63';
};




// function for circle markers
function createPropSymbols(data, map, attributes, viztypes){
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
    var vistype = viztypes

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var curVal = Number(feature.properties[attribute]);
            var attValue = curVal
            //build popup content string
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + feature.properties.Urban_Agglomeration + ", " + feature.properties.Country_or_area + "</p><p><b>" + "PM2.5 in " + year + ":</b> " + Number(feature.properties[attribute]).toFixed(1) + "</p>";
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            geojsonMarkerOptions.fillColor = calcColor(attValue);
             //create circle marker layer
            var markersLayer = L.circleMarker(latlng, geojsonMarkerOptions);
            //bind the popup to the circle marker
            markersLayer.bindPopup(popupContent)
            //return layer;
            //create circle markers
            //return L.circleMarker(latlng, geojsonMarkerOptions)
            return markersLayer;
            
            varForSearch(map, markersLayer)
        }
        
    }).addTo(map);

};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute,viztypef){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            viz_type = viztypef
            var props = layer.feature.properties;
            //console.log(props)
            // set up vars for this attribute
            var curVal = Number(props[attribute]);
            var histAvg = (props['ppm_1998'] + props['ppm_1999'] + props['ppm_2000']) / 3
            var chgVal =  curVal - histAvg
            var pctChgVal = (histAvg - curVal)/histAvg*-100
            //update color and size if percent change
            if (viz_type == "ppm_viz"){
            var radius = calcPropRadius(curVal);
            layer.setRadius(radius);
            //update color
            var fillColo = calcColor(curVal);
            layer.setStyle({fillColor:fillColo});}
             //update color and size if percent change
            else if (viz_type == "ppm_change") {
            var radius = calcPropRadius(chgVal);
            layer.setRadius(radius);
            var fillColo = calcColorChange(chgVal);
            layer.setStyle({fillColor:fillColo});}
            //update color and size if percent change
            else if ( viz_type == "ppm_pctChange") {
             var radius = calcPropRadius(pctChgVal);
            layer.setRadius(radius);
            var fillColo = calcColorPctChange(pctChgVal);
            layer.setStyle({fillColor:fillColo});}   
            //update popups
            var year = attribute.split("_")[1];
            var popupContent = "<p><b>City:</b> " + props.Urban_Agglomeration + ", " + props.Country_or_area + "</p><p><b>" + "PM2.5 in " + year + ":</b> " + curVal.toFixed(1) + "</p><p><b>" + "PM2.5 historical baseline (1998-2000):</b> " + histAvg.toFixed(1) + "</p>" + "</p><p><b>Change since historical baseline:</b> " + chgVal.toFixed(1) + "</p>" + "</p><p><b>Percent change since historical baseline:</b> " + pctChgVal.toFixed(1) + "%</p>";
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
            $("#curr_year").html(year);
        };
    });
};


// Create Buttons to switch viz type
function selectVizType(map, data, attributes, viztype2) {
    //create 3 buttons
    $('#panel2').append('<button class="vis_select active" id="ppm" name="ppm" type="button">Estimated PM2.5</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_change" name="ppm_change" type="button">Change in PM2.5 since Baseline (1998-2000)</button>')
    $('#panel2').append('<button class="vis_select" id="ppm_pctChange" name="ppm_pctChange" type="button">% Change in PM2.5 since Baseline (1998-2000)</button>')
    // set up listenters so that when clicked, a var will change that will be used in UpdatePropSymbols
    $('.vis_select').unbind().click(function(){
        //change color of selected button
        $('button').removeClass('active');
        $(this).addClass('active');
        // if the button is slected, change the viztype, then run manage, update
        if ($(this).attr('id') == 'ppm'){
            viztype2 = "ppm_viz"
            manageSequence(map,attributes, viztype2);
         updateLegend(map, data, attributes,viztype2);}
         else if ($(this).attr('id') == 'ppm_change'){
            viztype2 = "ppm_change"
            manageSequence(map,attributes, viztype2);
             updateLegend(map, data, attributes,viztype2);}
         
         else if ($(this).attr('id') == 'ppm_pctChange'){
            viztype2 = "ppm_pctChange"
            manageSequence(map,attributes, viztype2);
         updateLegend(map, data, attributes,viztype2)}
    });
   
}

function createControls(map,year){
    $('#panel').append('<button class="skip" id="reverse">Previous Year</button>');
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
   //set slider attributes
    $('.range-slider').attr({
        max: 21,
        min: 0,
        value: 0,
        step: 1
    });
    $('#panel').append('<button class="skip" id="curr_year">' + year +'</button>');
    $('#panel').append('<button class="skip" id="forward">Next Year</button>');
    
};

//Step 1: Create new sequence controls
function manageSequence(map, attributes, viztype){
    //Step 5: click listener for buttons
    //Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').unbind().click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 21 ? 0 : index;
            updatePropSymbols(map, attributes[index],viztype);
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 21 : index;
            updatePropSymbols(map, attributes[index],viztype);
        };

        //Step 8: update slider
        $('.range-slider').val(index);
    });
    //click listener for clicking on range
    $('.range-slider').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        updatePropSymbols(map, attributes[index], viztype);
        //console.log(index)
        console.log(index)
    })
    //update even if it wasnt clicked
    var index = $('.range-slider').val()
    updatePropSymbols(map, attributes[index], viztype);
};

//get max from an object
function getMax(arr, prop) {
    var max = -Infinity;
    for (var i=0 ; i<arr.length ; i++) {
        //console.log(arr[i].properties[prop])
        if (max == null || parseInt(arr[i].properties[prop]) > 
            max)
            max = arr[i].properties[prop];
        //console.log(max)
    }
    return max;
}

//get max from an object
function getMin(arr, prop) {
    var min = Infinity;
    for (var i=0 ; i<arr.length ; i++) {
        if (min == null || parseInt(arr[i].properties[prop]) < min)
            min = arr[i].properties[prop];
    }
    return min;
}

// get min and max from 1998 as a test
function minMax1998(data, attributes) {
    var min1998 = getMin(data.responseJSON.features, attributes[0])
    console.log(min1998)
    var max1998 = getMax(data.responseJSON.features, attributes[0])
    console.log(max1998)
    return min1998;
    return max1998;
    
}



//create original legend
function createLegend(map, data, attributes,viztype) {
    console.log(viztype)
    var min = getMin(data.responseJSON.features, attributes[0])
    var max = getMax(data.responseJSON.features, attributes[0])
    if (min < 10) {	
			min = 10; 
		}
		function roundNumber(inNumber) {
				return (Math.round(inNumber/10) * 10);  
		}
		var legend = L.control( { position: 'topleft' } );
		legend.onAdd = function(map) {
		var legendContainer = L.DomUtil.create("div", "legend");  
		var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
		var classes = [roundNumber(min), roundNumber((max-min)/2.5), roundNumber(max)]; 
		var legendCircle;  
		var lastRadius = 0;
		var currentRadius;
		var margin;
		L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
			L.DomEvent.stopPropagation(e); 
		});  
		$(legendContainer).append("<h2 id='legendTitle'>Average <br> Annual PM2.5</h2>");
		for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(symbolsContainer).append(legendCircle);
			lastRadius = currentRadius;
		}
		$(legendContainer).append(symbolsContainer); 
		return legendContainer; 
		};
		legend.addTo(map);  
// add color legend
    var legend2 = L.control({position: 'topleft'});
    legend2.onAdd = function(map) { 
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0,10,25,50,75,100];
    for (var i = 0; i < grades.length; i++) {
    div.innerHTML += '<i style="background:' + calcColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend2.addTo(map);
    
	} // end createLegend();


//update legend
function updateLegend(map, data, attributes,viztype2) {
    legend.remove()
    legend2.remove()
    console.log(viztype2)
    if (viztype == "ppm_viz") {
    var min = getMin(data.responseJSON.features, attributes[0])
    var max = getMax(data.responseJSON.features, attributes[0])
    if (min < 10) {	
			min = 10; 
		}
		function roundNumber(inNumber) {
				return (Math.round(inNumber/10) * 10);  
		}
		var legend = L.control( { position: 'topleft' } );
		legend.onAdd = function(map) {
		var legendContainer = L.DomUtil.create("div", "legend");  
		var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
		var classes = [roundNumber(min), roundNumber((max-min)/2.5), roundNumber(max)]; 
		var legendCircle;  
		var lastRadius = 0;
		var currentRadius;
		var margin;
		L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
			L.DomEvent.stopPropagation(e); 
		});  
		$(legendContainer).append("<h2 id='legendTitle'>Average <br> Annual PM2.5</h2>");
		for (var i = 0; i <= classes.length-1; i++) {  
			legendCircle = L.DomUtil.create("div", "legendCircle");  
			currentRadius = calcPropRadius(classes[i]);
			margin = -currentRadius - lastRadius - 2;
			$(legendCircle).attr("style", "width: " + currentRadius*2 + 
				"px; height: " + currentRadius*2 + 
				"px; margin-left: " + margin + "px");				
			$(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
			$(symbolsContainer).append(legendCircle);
			lastRadius = currentRadius;
		}
		$(legendContainer).append(symbolsContainer); 
		return legendContainer; 
		};
		legend.addTo(map);  
// add color legend
    var legend2 = L.control({position: 'topleft'});
    legend2.onAdd = function(map) { 
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0,10,25,50,75,100];
    for (var i = 0; i < grades.length; i++) {
    div.innerHTML += '<i style="background:' + calcColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend2.addTo(map);
    
	} 
    else if (viztype == "ppm_change") {
        console.log("ppm viz change")
    } 
    else if (viztype == "ppm_pctChange") {
        console.log("ppm viz % change")
    } 
    // end createLegend();
}



//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    data = $.ajax("data/cities_pop_estimates_Feature.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array, base year and base viz
            var attributes = ['ppm_1998','ppm_1999', 'ppm_2000', 'ppm_2001', 'ppm_2002', 'ppm_2003', 'ppm_2004', 'ppm_2005', 'ppm_2006', 'ppm_2007', 'ppm_2008', 'ppm_2009', 'ppm_2010', 'ppm_2011', 'ppm_2012', 'ppm_2013', 'ppm_2014', 'ppm_2015', 'ppm_2016', 'ppm_2017', 'ppm_2018', 'ppm_2019'];
            viztype = "ppm_viz"
            year = "1998"
            minMax1998(data, attributes)
            createPropSymbols(response, map,attributes,viztype);
            createControls(map, year);
            createLegend(map, data, attributes,viztype);
            selectVizType(map,data,attributes,viztype);
            manageSequence(map,attributes, viztype);
            
        }
    });
};








$(document).ready(createMap);


var map;
var widescreen;
var narrowscreen;
var items;
var lan;
var posmarker;

$(document).ready(
	function() {
		var yourpos = "Your position";
		lan = window.navigator.language.substring(0,2);
		switch(lan) {
			case "de": {
				document.getElementById("li_history").innerHTML = "Chronik";
				document.getElementById("a_about").innerHTML = "Impressum";
				document.getElementById("h_dev").innerHTML = "Entwickler";
				document.getElementById("h_data").innerHTML = "Daten";
				document.getElementById("w-back").innerHTML = "Schliessen";
				document.getElementById("nm-back").innerHTML = "Schliessen";
				document.getElementById("am-back").innerHTML = "Schliessen";
				yourpos = "Ihre Position";
				break;
			}
		}
		widescreen = window.matchMedia( "(min-width: 880px)" );
		narrowscreen  = window.matchMedia( "(max-width: 480px)" );
		agent = navigator.userAgent;
		if(!agent.match(/Android/i)) {
			console.log('Android style');
			// Load nativedroid/
			$('head').append(
					"<!-- FontAwesome - http://fortawesome.github.io/Font-Awesome/ -->"+
						"<link rel='stylesheet' href='css/nativedroid/font-awesome.min.css' />"+

						"<!-- nativedroid/ core CSS -->"+
						"<link rel='stylesheet' href='css/nativedroid/jquerymobile.nativedroid.css' />"+

						"<!-- nativedroid/: Light/Dark -->"+
						"<link rel='stylesheet' href='css/nativedroid/jquerymobile.nativedroid.dark.css'  id='jQMnDTheme' />"+

						"<!-- nativedroid/: Color Schemes -->"+
						"<link rel='stylesheet' href='css/nativedroid/jquerymobile.nativedroid.color.blue.css' id='jQMnDColor' />"+
						"<script src='js/nativedroid.script.js'></script>"
			);
			// Prepare header elements for use with nativedroid
			var menu_android = document.createElement("i");
			menu_android.setAttribute("class", "lIcon fa fa-bars");
			document.getElementById("menubutton").appendChild(menu_android);
			if(!widescreen.matches) document.getElementById('title').removeChild(document.getElementById('pos'));
			
			// Make the Android-page default
			document.getElementById("a_contentpage").id = 'contentpage';
			document.getElementById("am-name").id = 'm-name';
			document.getElementById("am-image").id = 'm-image';
			document.getElementById("am-content").id = 'm-content';
			document.getElementById("am-link").id = 'm-link';
		}
		else {
			// Add or remove button texts
			if(widescreen.matches) {
				document.getElementById("menubutton").innerHTML = "Menu";
				document.getElementById("menubutton").setAttribute("class", "ui-btn ui-btn-inline ui-icon-bars ui-btn-icon-left ui-btn-left ui-corner-all");
				document.getElementById("pos").innerHTML = "Position";
				document.getElementById("pos").setAttribute("class", "ui-btn ui-btn-inline ui-icon-location ui-btn-icon-left ui-btn-right ui-corner-all");
			}
			else {
				document.getElementById("menubutton").setAttribute("class", "ui-btn ui-btn-inline ui-icon-bars ui-btn-icon-notext ui-btn-left ui-corner-all");
				document.getElementById("pos").setAttribute("class", "ui-btn ui-btn-inline ui-icon-location ui-btn-icon-notext ui-btn-right ui-corner-all");
				document.getElementById("nm-back").setAttribute("class", "ui-btn ui-btn-inline ui-shadow ui-corner-all ui-btn-b ui-icon-back ui-btn-icon-notext");
				document.getElementById("nm-back").innerHTML = "";
				document.getElementById("nm-link").setAttribute("class", "ui-btn ui-btn-inline ui-shadow ui-corner-all ui-btn-b ui-icon-info ui-btn-icon-notext ui-btn-right");
				document.getElementById("nm-link").innerHTML = "";
			}
			// Make the non-Android-page default
			document.getElementById("n_contentpage").id = 'contentpage';
			document.getElementById("nm-name").id = 'm-name';
			document.getElementById("nm-image").id = 'm-image';
			document.getElementById("nm-content").id = 'm-content';
			document.getElementById("nm-link").id = 'm-link';
		}
	
	map = new L.Map('map');

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {
		attribution: osmAttrib
	});
	var bounds_text = "berlin";
	var bounds_berlin = L.latLngBounds([52.33, 13.77], [52.69, 13.08]);

	var user = L.icon({
	    iconUrl: 'js/images/User-32.png',
	    iconSize:     [32, 32],
	    iconAnchor:   [16, 31],
	    popupAnchor:  [1, -31]
	});
	
	// start the map in Berlin
	// setView must be called in case the user ignores the location request or chooses "Not now" (Firefox), which fires no callback
	map.setView(bounds_berlin.getCenter(),18);
	map.setMaxBounds(bounds_berlin);
	map.addLayer(osm);
	posmarker = L.marker([1,1], {icon: user}).bindPopup(yourpos).addTo(map);
	
	
	
	// If supported, set marker on current location. User can still deny.
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(geolocation_action, errors_action, {enableHighAccuracy : true});
	}
	
	$('#pos').click(function() {
		navigator.geolocation.getCurrentPosition(geolocation_action, errors_action, {enableHighAccuracy : true});
	});
	
	map.whenReady(function(event) {
		getMarkers(bounds_text);
	});

});
	
function geolocation_action(position){
	// Center map on position and place a marker with popup there 
    var latlng = new L.LatLng(position.coords.latitude,position.coords.longitude);
    map.panTo(latlng);
    map.setZoom(18);
    posmarker.setLatLng(latlng).update().openPopup();
}

function errors_action(error) {
    switch(error.code){
        case error.PERMISSION_DENIED: console.log("Der Nutzer m&ouml;chte keine Daten teilen.");break;
        case error.POSITION_UNAVAILABLE: console.log("Die Geodaten sind nicht erreichbar.");break;
        case error.PERMISSION_DENIED: console.log("Timeout erhalten");break;
        default: console.log("Unbekannter Error");break;
    }
}

function getMarkers(bounds) {
	$.ajax({
		type: "GET",
		url: "data/" + bounds + ".json",
		dataType: "json",
		success: function(json) {
				var markers = L.markerClusterGroup();			
				items = L.geoJson(json, {
					onEachFeature: getData
				});
				markers.addLayer(items);
				map.addLayer(markers);
		}
	});
}

function getData(feature, layer) {
    layer.on('click', function(e){
    	var id=feature.properties.wikiPageID,
			image="",
			name="",
			content="",
			select = "SELECT * ",
			where = "WHERE{?res dbpedia-owl:wikiPageID " + id + " ; rdfs:label ?name ; dbpedia-owl:abstract ?content ; owl:sameAs ?redirect OPTIONAL {?res dbpedia-owl:thumbnail ?image BIND(?image as ?image)} ",
			filter = "FILTER(lang(?name) = \"" + lan + "\" || lang(?name) = \"en\") FILTER(lang(?content) = \"en\" || lang(?content) = \"" + lan + "\")";
    	//console.log(select + where + filter + "}");
		var queryUrl = encodeURIComponent(select + where + filter + "}");
		var fullUrl = "http://dbpedia.org/sparql?query=" + queryUrl + "&format=application%2Fjson";
		$.ajax({
	  		dataType: "jsonp",
	  		timeout : 5000,
	  		url: fullUrl,
	  		async: false,
	  		beforeSend: function( jqXHR, settings ) {$.mobile.loading( 'show' );},
			complete: function( jqXHR, settings ) {$.mobile.loading( 'hide' );},
	  		success: function(data) {
	  			var href = "http://en.wikipedia.org/?curid=" + id;
	  			var allfound = false, namefound = false, contentfound = false;
	  			var results = data.results.bindings;
		  		for(var r in results) {
		  			var vars = results[r];
		  			for(var i in vars) {
		  				switch(i) {
		  					case "image": image = results[r].image.value; break;
		  					case "name": 
		  						if(results[r].name["xml:lang"].indexOf(lan) > -1) {
		  							name = results[r].name.value;
		  							namefound = true;
		  						}
		  						else if(results[r].name["xml:lang"].indexOf("en") > -1 && !namefound) name = results[r].name.value;
		  						break;
		  					case "content": 
		  						if(results[r].content["xml:lang"].indexOf(lan) > -1) {
		  							content = results[r].content.value;
		  							contentfound = true;
		  						}
		  						else if(results[r].content["xml:lang"].indexOf("en") > -1 && !contentfound) content = results[r].content.value;	
		  						break;
		  					case "redirect": if(results[r].redirect.value.indexOf(lan + ".dbpedia.org") > -1)
		  						href = results[r].redirect.value.replace(/dbpedia.org.resource/, "wikipedia.org/wiki");
		  					break;
		  				}
		  			}
		  			if(namefound && contentfound && href.indexOf("wikipedia.org/wiki") >0) {
		  				break;
		  			}
		  		}
		  		
		  		var li_entry = document.createElement("li");
		  		var a_entry = document.createElement("a");
		  		li_entry.setAttribute('data-icon', 'false');
		  		a_entry.href='#';
		  		a_entry.setAttribute('onclick', 'showContentfromHistory("' + name + '", "' + image + '", "' + content + '", "' + href + '")');
		  		if(image.length > 0) {
		  			var img_entry = document.createElement("img");
		  			img_entry.src = image;
		  			a_entry.appendChild(img_entry);
		  		}
		  		var h_entry = document.createElement("h2");
		  		h_entry.innerHTML = name;
		  		var p_entry = document.createElement("p");
		  		p_entry.innerHTML = content;
		  		
		  		a_entry.appendChild(h_entry);
		  		a_entry.appendChild(p_entry);
		  		
		  		li_entry.appendChild(a_entry);
		  		document.getElementById("history").appendChild(li_entry);
		  		$("#history").listview( "refresh" );
		  		showContent(name, image, content, href, layer);
		  	},
		  	error: function(jqXHR, textStatus, errorThrown) {
		  	  console.log(textStatus, errorThrown);
		  	  $( "#error" ).popup( "open" );
		  	}
		});
    });
}

function showContent(name, image, content, href, layer) {
	if(widescreen.matches) {
		// Wide screen: Open Panel
			layer.bindPopup(name, {autoPan: false}).openPopup();
		document.getElementById("w-name").innerHTML = name;
		
		document.getElementById("w-image").src = image;
		document.getElementById("w-content").innerHTML = content;
		document.getElementById("w-link").href = href;
		$( "#contentpanel" ).panel({
			beforeclose: function( event, ui ) {layer.closePopup().unbindPopup();}
		});
		$( "#contentpanel" ).trigger( "pagecreate" );
		$( "#contentpanel" ).panel( "open" );
	}
	else {
		// Mobile screen: Open new page
		document.getElementById("m-name").innerHTML = name;
		document.getElementById("m-image").src = image;
		document.getElementById("m-content").innerHTML = content;
		document.getElementById("m-link").href = href.replace(/wikipedia.org/, "m.wikipedia.org");
		$( "body" ).pagecontainer( "change", "#contentpage", {
			transition: "pop"
		});
	}
}

function showContentfromHistory(name, image, content, href) {
	if(widescreen.matches) {
		// Wide screen: Open Panel
		document.getElementById("w-name").innerHTML = name;
		
		document.getElementById("w-image").src = image;
		document.getElementById("w-content").innerHTML = content;
		document.getElementById("w-link").href = href;
		$( "#contentpanel" ).trigger( "pagecreate" );
		$( "#contentpanel" ).panel( "open" );
	}
	else {
		// Mobile screen: Open new page
		document.getElementById("m-name").innerHTML = name;
		document.getElementById("m-image").src = image;
		document.getElementById("m-content").innerHTML = content;
		document.getElementById("m-link").href = href.replace(/wikipedia.org/, "m.wikipedia.org");
		$( "body" ).pagecontainer( "change", "#contentpage", {
			transition: "pop"
		});
	}
}
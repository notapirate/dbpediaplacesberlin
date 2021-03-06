var map;
var widescreen;
var narrowscreen;
var items;
var lan;
var posmarker;
var markerlist = {};
var bounds_berlin;
var markers;

$(document).ready(
	function() {
		var yourpos = "Your position",
			posmark = "Mark position",
			search = "Search",
			menutext = "Menu",
			contact = "Contact",
			lat,lng;
			lan = window.navigator.language.substring(0,2);
		switch(lan) {
			case "de": {
				yourpos = "Ihre Position",
				menutext = "Men&uuml;",
				search = "Suche",
				contact = "Kontakt",
				posmark = "Position markieren";
				document.getElementById("changehead").innerHTML = "Auf globale Seite wechseln?";
				document.getElementById("changetext").innerHTML = "Sie befinden sich ausserhalb von Berlin. M&ouml;chten Sie auf DBpedia Places wechseln?";
				document.getElementById("changenow").innerHTML = "Ja, neue Seite jetzt aufrufen";
				document.getElementById("nochange").innerHTML = "Nein, ich will noch in Berlin bleiben";
				document.getElementById("li_history").innerHTML = "Chronik";
				document.getElementById("a_about").innerHTML = "Impressum";
				document.getElementById("h_dev").innerHTML = "Entwickler";
				document.getElementById("h_data").innerHTML = "Daten";
				document.getElementById("w-back").innerHTML = "Schliessen";
				document.getElementById("nm-back").innerHTML = "Zur&uuml;ck";
				document.getElementById("am-back").innerHTML = "<i class='lIcon fa fa-undo'></i>Zur&uuml;ck";
				document.getElementById("filterable-input").setAttribute('placeholder', search);
				document.getElementById("searchbutton").innerHTML = search;
				break;
			}
		}
		widescreen = window.matchMedia( "(min-width: 880px)" );
		narrowscreen  = window.matchMedia( "(max-width: 480px)" );
		agent = navigator.userAgent;
		if(agent.match(/Android/i)) {
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
			var pos_android = document.createElement("i");
			pos_android.setAttribute("class", "lIcon fa fa-search");
			document.getElementById("search").appendChild(pos_android);
			/*if(widescreen.matches) {
				document.getElementById("search").innerHTML += search;
			}*/
			
			// Make the Android-page default
			document.getElementById("a_contentpage").id = 'contentpage';
			document.getElementById("am-name").id = 'm-name';
			document.getElementById("am-image").id = 'm-image';
			document.getElementById("am-content").id = 'm-content';
			document.getElementById("am-link").id = 'm-link';
		}
		else {
			// Add or remove button texts
			if(widescreen.matches || agent.match(/(iPhone)|(iPad)|(iPod)/i)) {
				document.getElementById("menubutton").innerHTML = menutext;
				document.getElementById("menubutton").setAttribute("class", "ui-btn ui-btn-inline ui-icon-bars ui-btn-icon-left ui-btn-left ui-corner-all");
				document.getElementById("search").innerHTML = search;
				document.getElementById("search").setAttribute("class", "ui-btn ui-btn-inline ui-icon-search ui-btn-icon-left ui-btn-right ui-corner-all");
			}
			else {
				document.getElementById("menubutton").setAttribute("class", "ui-btn ui-btn-inline ui-icon-bars ui-btn-icon-notext ui-btn-left ui-corner-all");
				document.getElementById("search").setAttribute("class", "ui-btn ui-btn-inline ui-icon-search ui-btn-icon-notext ui-btn-right ui-corner-all");
				document.getElementById("nm-back").setAttribute("class", "ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-back ui-btn-icon-notext");
				document.getElementById("nm-back").innerHTML = "";
				document.getElementById("nm-link").setAttribute("class", "ui-btn ui-btn-inline ui-shadow ui-corner-all ui-icon-info ui-btn-icon-notext ui-btn-right");
				document.getElementById("nm-link").innerHTML = "";
			}
			if(agent.match(/(iPhone)|(iPad)|(iPod)/i)) {
				$("#mappage, #n_contentpage, #changesite").removeClass('ui-page-theme-b').addClass('ui-page-theme-c');
				$("#title, #nm-title").removeClass('ui-bar-b').addClass('ui-bar-c');
				// Make Leaflet tooltip background color white
				document.styleSheets[7].cssRules[1].style.backgroundColor='#FFF';
				document.getElementById("menubutton").setAttribute("class", "ui-btn ui-btn-inline ui-btn-left ui-corner-all");
				document.getElementById("search").setAttribute("class", "ui-btn ui-btn-inline ui-btn-right ui-corner-all");
				document.getElementById("nm-back").setAttribute("class", "ui-btn ui-btn-inline ui-btn-left ui-corner-all");
				document.getElementById("nm-link").setAttribute("class", "ui-btn ui-btn-inline ui-btn-right ui-corner-all");
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
	var bounds_text = "berlin";
	bounds_berlin = L.latLngBounds([52.33, 13.77], [52.69, 13.08]);
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {
		minZoom: 12,
		attribution: osmAttrib,
		bounds: bounds_berlin,
		reuseTiles: true
	});

	var user = L.icon({
	    iconUrl: 'js/images/User-32.png',
	    iconSize:     [32, 32],
	    iconAnchor:   [16, 31],
	    popupAnchor:  [1, -31]
	});
	
	var args = getUrlVars();
	lat = bounds_berlin.getCenter().lat;
	lng = bounds_berlin.getCenter().lng;
	
	// start the map in Berlin
	// setView must be called in case the user ignores the location request or chooses "Not now" (Firefox), which fires no callback
	map.setView([lat,lng],18);
	map.addLayer(osm);
	var lc = L.control.locate({
	    //position: 'topleft',  // set the location of the control
	    drawCircle: false,  // controls whether a circle is drawn that shows the uncertainty about the location
	    follow: false,  // follow the user's location
	    setView: false, // automatically sets the map view to the user's location, enabled if `follow` is true
	    keepCurrentZoomLevel: false, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
	    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
	    remainActive: false, // if true locate control remains active on click even if the user's location is in view.
	    markerClass: L.marker, // L.circleMarker or L.marker
	    markerStyle: {icon: user},
	    followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
	    followMarkerStyle: {},
	    icon: 'icon-location',  // `icon-location` or `icon-direction`
	    //iconLoading: 'icon-spinner  animate-spin',  // class for loading icon
	    //circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
	    metric: true,  // use metric or imperial units
	    onLocationError: function(err) {alert(err.message)},  // define an error callback function
	    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
	            //alert(context.options.strings.outsideMapBoundsMsg);
	    },
	    strings: {
	        title: posmark,  // title of the locate control
	        popup: yourpos,  // text to appear if user clicks on circle
	        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
	    },
	    locateOptions: {enableHighAccuracy: true}  // define location options e.g enableHighAccuracy: true or maxZoom: 10
	}).addTo(map);
	
	if(args.length > 1) {
		
		// Coordinates given from DBpedia Places
		lat = args["lat"];
		lng = args["lng"];
		console.log(lat + ' ' + lng);
		posmarker = L.marker([lat,lng], {icon: user}).bindPopup(yourpos).addTo(map);
		posmarker.openPopup();
	}
	else {
		// If supported, set marker on current location. User can still deny.
		if ("geolocation" in navigator) {
			//navigator.geolocation.getCurrentPosition(geolocation_action, errors_action, {enableHighAccuracy : true});
			map.on('locationfound', onLocationFound);
			map.locate({enableHighAccuracy: true});
		}
		posmarker = L.marker([1,1], {icon: user}).bindPopup(yourpos).addTo(map);
	}
	
	
	
	map.whenReady(function(event) {
		getMarkers(bounds_text);
	});
	
	var a = new Array('.ms','nline','dev@o');
	document.getElementById("h_name").innerHTML += "<a href='mailto:"+a[2]+a[1]+a[0]+"'>(" + contact + ")</a>";

});

$('#places, #about').on({
	  popupbeforeposition: function() {
	    var maxHeight = $(window).height() - 30;
	    $('#places, #about').css('max-height', maxHeight + 'px');
	  }
});

/**
 * Read a page's GET URL variables and return them as an associative array.
 */
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function onLocationFound(e) {
	if(bounds_berlin.contains(e.latlng)) {
    	map.panTo(e.latlng);
    	map.setZoom(18);
    	posmarker.setLatLng(e.latlng).update().openPopup();
    }
    else {
    	document.getElementById('changenow').href = 'http://dbpediaplaces.tk?lat=' + e.latlng.lat + "&lng=" + e.latlng.lng;
    	$( "#changesite" ).popup();
    	$( "#changesite" ).popup("open");
    }
}

function errors_action(error) {
    switch(error.code){
        case error.PERMISSION_DENIED: console.log("Der Nutzer m&ouml;chte keine Daten teilen.");break;
        case error.POSITION_UNAVAILABLE: console.log("Die Geodaten sind nicht erreichbar.");break;
        case error.PERMISSION_DENIED: console.log("Timeout erhalten");break;
        default: console.log("Unbekannter Error");break;
    }
}

/**
 * Create entry for an overview list of all markers
 * @param name
 * @param id
 */
function createOverviewEntry(name, id, lat, long) {
	
	var li = document.createElement("li");
	var a = document.createElement("a");
	a.href="#";
	a.innerHTML=name;
	a.onclick = function (e) {
		e.preventDefault(); 
		$("#places").popup("close"); 
		map.setView([lat,long],18);
		var marker = markerlist[id];
		if(markers.hasLayer(marker)) markers.zoomToShowLayer(marker, function(e) {marker.fire('click')});
		else marker.fireEvent("click");
	};
	li.appendChild(a);
	document.getElementById("placeslist").appendChild(li);
}

function getMarkers(bounds) {
	$.ajax({
		type: "GET",
		url: "data/" + bounds + ".json",
		dataType: "json",
		beforeSend: function( jqXHR, settings ) {$.mobile.loading( 'show' );},
		complete: function( jqXHR, settings ) {$.mobile.loading( 'hide' );},
		success: function(json) {
				markers = L.markerClusterGroup();			
				items = L.geoJson(json, {
					pointToLayer: function (feature, latlng) {
						var marker = new L.Marker( latlng );
						markerlist[feature.properties.wikiPageID] = marker;
						return marker;
					},
					onEachFeature: getData
				});
				markers.addLayer(items);
				map.addLayer(markers);
				$( "#placeslist" ).filterable( "refresh" );
				$('#places').css('overflow-y', 'scroll');
		}
	});
}

function getData(feature, layer) {
	var id=feature.properties.wikiPageID,
		image="",
		name="",
		content="",
		namefound = false,
		select = "SELECT * ",
		where = "WHERE{?res dbpedia-owl:wikiPageID " + id + " ; dbpedia-owl:abstract ?content ; owl:sameAs ?redirect OPTIONAL {?res dbpedia-owl:thumbnail ?image BIND(?image as ?image)} ",
		filter = "FILTER(lang(?content) = \"en\" || lang(?content) = \"" + lan + "\")",
		queryUrl = encodeURIComponent(select + where + filter + "}"),
		fullUrl = "http://dbpedia.org/sparql?query=" + queryUrl + "&format=application%2Fjson";
	for(var i in feature.properties.label) {
		switch (feature.properties.label[i].lang) {
			case lan: name = feature.properties.label[i].value; namefound = true; break;
			case "en": name = feature.properties.label[i].value; break;
			default: if(!name.match(/\S+.*/)) name = feature.properties.label[0].value; break;
		}
		if(namefound) break;
	}
	createOverviewEntry(name, id, feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
	layer.bindPopup(name);
	layer.on("mouseover", function(e) {layer.openPopup();});
    layer.on('click', function(e){
		$.ajax({
	  		dataType: "jsonp",
	  		timeout : 5000,
	  		url: fullUrl,
	  		async: false,
	  		beforeSend: function( jqXHR, settings ) {$.mobile.loading( 'show' );},
			complete: function( jqXHR, settings ) {$.mobile.loading( 'hide' );},
	  		success: function(data) {
	  			var href = "http://en.wikipedia.org/?curid=" + id;
	  			var allfound = false, contentfound = false;
	  			var results = data.results.bindings;
		  		for(var r in results) {
		  			var vars = results[r];
		  			for(var i in vars) {
		  				switch(i) {
		  					case "image": image = results[r].image.value; break;
		  					/*case "name": 
		  						if(results[r].name["xml:lang"].indexOf(lan) > -1) {
		  							name = results[r].name.value;
		  							namefound = true;
		  						}
		  						else if(results[r].name["xml:lang"].indexOf("en") > -1 && !namefound) name = results[r].name.value;
		  						break;*/
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
		  			if(contentfound && href.indexOf("wikipedia.org/wiki") >0) {
		  				break;
		  			}
		  		}
		  		
		  		var li_entry = document.createElement("li");
		  		var a_entry = document.createElement("a");
		  		li_entry.setAttribute('data-icon', 'false');
		  		a_entry.href='#';
		  		a_entry.setAttribute('onclick', 'showContent("' + name + '", "' + image + '", "' + content + '", "' + href + '", "' + id + '", ' + true + ')');
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
		  		showContent(name, image, content, href, id, false);
		  	},
		  	error: function(jqXHR, textStatus, errorThrown) {
		  	  console.log(textStatus, errorThrown);
		  	  $( "#error" ).popup( "open" );
		  	}
		});
    });
}

function showContent(name, image, content, href, id, pan) {
	var layer = markerlist[id];
	if(widescreen.matches) {
		// Wide screen: Open Panel
		if(pan) map.panTo(layer.getLatLng());
		layer.bindPopup(name, {autoPan: false}).openPopup();
		document.getElementById("w-name").innerHTML = name;
		document.getElementById("w-image").src = image;
		document.getElementById("w-content").innerHTML = content;
		document.getElementById("w-link").href = href;
		$( "#contentpanel" ).panel({
			beforeclose: function( event, ui ) {layer.closePopup();}
		});
		$( "#contentpanel" ).trigger( "updatelayout" );
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

/*function showContentfromHistory(name, image, content, href) {
	if(widescreen.matches) {
		// Wide screen: Open Panel
		document.getElementById("w-name").innerHTML = name;
		
		document.getElementById("w-image").src = image;
		document.getElementById("w-content").innerHTML = content;
		document.getElementById("w-link").href = href;
		$( "#contentpanel" ).trigger( "updatelayout" );
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
}*/
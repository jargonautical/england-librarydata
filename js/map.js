﻿$(function () {
    jQuery.fn.reverse = [].reverse;
    /////////////////////////////////////////////////
    // Map - Initialise the map, set center, zoom, etc.
    /////////////////////////////////////////////////
    var authBoundaries = null;
    var libraries = null;
    var markerArray = L.layerGroup([]);
    var selectedAuth = '';
    var style = 1;
    var map = L.map('map', { zoomControl: false }).setView([52.55, -2.72], 7);
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGlicmFyaWVzaGFja2VkIiwiYSI6IlctaDdxSm8ifQ.bxf1OpyYLiriHsZN33TD2A', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.  Contains OS data &copy; Crown copyright and database right 2016.  Contains Royal Mail data &copy; Royal Mail copyright and Database right 2016.  Contains National Statistics data &copy; Crown copyright and database right 2016.'
    }).addTo(map);
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    var sidebar = L.control.sidebar('sidebar', {
        position: 'left'
    });
    map.addControl(sidebar);

    var numFormat = function (num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    };

    /////////////////////////////////////////////////////////
    // Function setMapStyles
    // Sets the styles of the map.
    // Map shading options
    // 1. Number of libraries
    // 2. Libraries per population
    // Closed libraries
    // 3. Local news stories (PLN)
    // 4. Changes (PLN)
    /////////////////////////////////////////////////////////
    var setMapStyles = function () {
        authBoundaries.setStyle(function (feature) {
        				var style = config.boundaryLines.normal;
            if (feature.properties['authority_id'] == selectedAuth && feature.properties['authority_id'] == 71) return config.boundaryLines.le;
            if (feature.properties['authority_id'] == selectedAuth) return { color: "#5E5E5E", weight: 3, opacity: 0.8, fillOpacity: 0 };
            var libKeys = Object.keys(libraries);
            libKeys.sort(function (a, b) {
                if (mapType == 1) return libraries[a].length - libraries[b].length;
                if (mapType == 2) return (libraries[a].length / feature.properties['authority_id'].population) - (libraries[b].length / feature.properties['authority_id'].population);
            });
            var position = libKeys.indexOf(String(feature.properties['authority_id']));
            var med = (position / libKeys.length);
            style.fillOpacity = med.toFixed(1);
            return style;
        });
    };

    /////////////////////////////////////////////////////////
    // Function: addLibrariesToMap
    /////////////////////////////////////////////////////////
    var addLibrariesToMap = function (libraries) {
        map.removeLayer(markerArray);
        markerArray.clearLayers();
        $.each(libraries, function (x, lib) {
            var style = { radius: 4, stroke: true, color: libStyles[lib.type].colour };
            var m = L.circleMarker([lib.lat, lib.lng], style);
            m.on('click', function (e) {
                clickLibrary(lib);
            });
            m.bindTooltip(lib.name, { });
            markerArray.addLayer(m);
        });
        map.addLayer(markerArray);
    };

    /////////////////////////////////////////////////////////
    // Function: clickLibrary
    /////////////////////////////////////////////////////////
    var clickLibrary = function (lib) {
        $('#divLibSelected').empty();
        $('#divLibSelected').append('<p class="lead text-' + libStyles[lib.type].cssClass + '">' + lib.name + '</p>');
        $('#divLibSelected').append('<p>' + libStyles[lib.type].type + '<br/>Address' + lib.postcode + '<br/></p>');
        if (lib.closed == 't') $('#divLibSelected').append('<p class="text-danger">Library closed ' + lib.closed_year + '</p>');
        map.flyTo(L.latLng(lib.lat, lib.lng), 13);
    };

    /////////////////////////////////////////////////////////
    // Function: displayPLNStories
    // For a feature (authority) - displays the PLN stories
    // into the sidebar.
    /////////////////////////////////////////////////////////
    var displayPLNStories = function (type, properties, header) {
        if (properties[type]) {
            $('#sidebar').append('<hr>');
            var st = properties[type].stories.slice();
            $('#sidebar').append('<h4>' + header + '</h4>');
            $.each(st.reverse(), function () {
                $('#sidebar').append('<small>' + moment(this.date).fromNow() + '</small><p>' + this.text.replace(properties.name + ' – ', '') + '</p>');
            });
        }
    };

    /////////////////////////////////////////////////////////
    // Function: clickAuth
    /////////////////////////////////////////////////////////
    var clickAuth = function (e, feature, layer) {
        map.flyToBounds(layer.getBounds(), { paddingTopLeft: L.point(400, 0) });
        selectedAuth = feature.properties['authority_id'];

        $('#sidebar').empty();
        // Show authority details
        $('#sidebar').append('<h3>' + feature.properties.name + '</h3>');
        $('#sidebar').append('<div class="row"><div class="col col-md-4"><p class="lead text-info">' + numFormat(feature.properties.population) + ' people</p></div><div class="col col-md-4"><p class="lead text-warning">' + numFormat(feature.properties.hectares) + ' hectares</p></div><div class="col col-md-4"><p class="lead text-success">' + numFormat(libraries[feature.properties['authority_id']].length) + ' libraries</p></div><//div>');

        $('#sidebar').append('<hr>');
        // Show libraries group by type
        $('#sidebar').append('<div id="divLibSelected"><p>Select a library to see further details.</p></div>');
        $('#sidebar').append('<h4>Libraries</h4>');
        var libs = {};
        $.each(libraries[feature.properties['authority_id']], function (i, lib) {
            if (!libs[lib.type]) libs[lib.type] = { libs: [] };
            if ((lib.type != '' && lib.closed == '') || lib.lat != '') libs[lib.type].libs.push(lib);
        });
        $.each(Object.keys(libs), function (i, k) {
            if (libs[k].libs.length > 0) {
                var type = $('<div>');
                var hd = $('<h5>', {
                    text: libs[k].libs.length + ' ' + libStyles[k].type
                }).appendTo(type);
                $.each(libs[k].libs, function (x, l) {
                    $('<a>', {
                        text: l.name,
                        title: l.name,
                        href: '#',
                        'class': 'btn btn-xs btn-' + libStyles[l.type].cssClass + ' btn-libs',
                        click: function () {
                            clickLibrary(l);
                            return false;
                        }
                    }).appendTo(type);
                });
                

                $('#sidebar').append(type);
            }
        });
        addLibrariesToMap(libraries[feature.properties['authority_id']]);
        displayPLNStories('changes', feature.properties, 'Changes');
        displayPLNStories('local', feature.properties, 'Local news');
        sidebar.show();
        setMapStyles();
    };

    /////////////////////////////////////////////////////////////
    // INIT
    // Load the initial set of data
    /////////////////////////////////////////////////////////////
    PublicLibrariesNews.loadData(3, true, false, true, function () {
        var authGeo = PublicLibrariesNews.getAuthGeoWithStories();
        libraries = PublicLibrariesNews.getLibrariesByAuthority();
        var onEachFeature = function (feature, layer) {
            layer.on('click', function (e) {
                clickAuth(e, feature, layer)
            });
        };
        // Now load in the authority boundaries 
        authBoundaries = new L.geoJson(null, {
            onEachFeature: onEachFeature
        });
        authBoundaries.addTo(map);
        $(authGeo.features).each(function (key, data) {
            authBoundaries.addData(data);
        });
        setMapStyles();
    });
});
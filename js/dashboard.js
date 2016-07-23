﻿$(function () {
    /////////////////////////////////////////////////
    // Map
    // Initialise the map, set center, zoom, etc.
    /////////////////////////////////////////////////
    var changesMarkers = [];
    var newsMarkers = [];
    var map = L.map('divMiniMap', { zoomControl: false }).setView([52.55, -2.72], 7);
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/librarieshacked.jefmk67b/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Load the initial set of data - for the dashboard start with 1 month
    PublicLibrariesNews.loadData(1, function () {
        var local = PublicLibrariesNews.getStoriesGroupedByLocation('local');
        var changes = PublicLibrariesNews.getStoriesGroupedByLocation('changes');

        //////////////////////////////////////////////
        // 1. Populate the changes top 5
        //////////////////////////////////////////////
        var locs = Object.keys(changes);
        locs.sort(function(a,b){
            return changes[b].stories.length - changes[a].stories.length; 
        });
        locs = locs.slice(0, 3);
        $.each(locs, function(){
            $('#divTopCountChanges').append('<a class="list-group-item changes-list" data-auth="' + this + '" href="#"><span class="badge">' + changes[this].stories.length + '</span>' + this + '</a>');
        });
        $('.changes-list').click(function (event) {
            event.preventDefault();
            var authSt = changes[$(event.target).data('auth')].stories;
            $('#pCurrentChanges').html(authSt.map(function (auth) {
                return auth.text;
            }).join('<br/>'));
        });

        //////////////////////////////////////////////
        // 1. Populate the map
        //////////////////////////////////////////////
        $.each(local, function (i, o) {
            var size = ['small', 20];
            if (o.stories.length >= 5) size = ['medium', 30];
            if (o.stories.length >= 10) size = ['large', 40];
            var newsIcon = L.divIcon({ html: '<div><span>' + o.stories.length + '</span></div>', className: "marker-cluster marker-cluster-" + size[0], iconSize: new L.Point(size[1], size[1]) });
            var marker = L.marker([o.lat, o.lng], { icon: newsIcon });
            marker.stories = o.stories;
            marker.title = i;
            // Attach a click event to the marker.
            var markerClick = function (e) {
                // Set the modal content
                $('#mdlList').empty();
                $('#mdlTitle').text(e.target.title);
                $.each(e.target.stories, function () {
                    $('#mdlList').append('<a class="list-group-item" href="' + this.url + '" target="_blank"><h4 class="list-group-item-heading">' + moment(this.date).fromNow() + '</h4><p class="list-group-item-text">' + this.text + '</p></a>');
                });
                $('#markerModal').modal();
            };
            marker.on('click', markerClick);
            marker.addTo(map);
            newsMarkers.push(marker);
        });
    });
});
/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [40.70531887544228, -74.00976419448853, 15]; // NYC

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map',
        {"keyboardZoomOffset" : .05}
    );

    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    // setView expects format ([lat, long], zoom)
    map.setView(map_start_location.slice(0, 3), map_start_location[2]);

    // adust the origin point of the shader for scaling and panning
    var move_shader = function(e) {
        // set the origin of the cm_halftone shader
        scene.styles.cm_halftone_polygons.shaders.uniforms.center = [e.clientX,e.clientY];
    }

    // "clicked" state toggle: don't adjust the shader if the mouse is only moving
    var mousetrap = false;
    var mouse_monitor = function(e) {
        if (mousetrap) {
            move_shader(e);
        }
    }

    /***** Render loop *****/

    window.addEventListener('load', function () {
        // add event listeners and set toggle for shader adjustment
        this.addEventListener('mousemove', mouse_monitor);
        this.addEventListener('mousewheel', move_shader, true);
        this.addEventListener("mousedown", function() {mousetrap=true;});
        this.addEventListener("mouseup", function() {mousetrap=false;});
        this.addEventListener("drag", function() {mousetrap=true;});
        this.addEventListener("dragend", function() {mousetrap=false;});

        // Scene initialized
        layer.on('init', function() {
        });
        layer.addTo(map);
    });

    return map;

}());

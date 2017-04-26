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

    var mousetrap = false;
    var mouse_monitor = function(e) {
        var height = document.body.clientHeight;
        var width = document.body.clientWidth;

        var x = e.clientX;
        var y = e.clientY;
        var xpos = ((x - (width / 2)));
        var ypos = ((y - (height / 2)))*-1.;

        // scene.styles.cm_halftone_polygons.center = [xpos,ypos];
        // console.log(xpos,ypos);
        if (mousetrap) scene.styles.cm_halftone_polygons.shaders.uniforms.center = [x,y];
    }

    window.onload = function() {
      this.addEventListener('mousemove', mouse_monitor);
      this.addEventListener('mousedown', function(){mousetrap = true;});
      this.addEventListener('mouseup', function(){mousetrap = false;});
    }

    function MouseWheelHandler(e) {

        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        console.log(delta);
    }
    /***** Render loop *****/

    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
          this.addEventListener("mousewheel", function() {console.log('test')}, false);
        });
        layer.addTo(map);
    });

    return map;

}());

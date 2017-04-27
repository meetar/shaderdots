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

    // GUI options for rendering modes/effects
    var style_controls = {
        'radius': 2.5,
        'scale': 50,
    };

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true });
    function addGUI () {
        gui.add(style_controls, 'radius', 0, 5).onChange(function(value) {
            mousetrap = false; // don't animate the shader during value change
            scene.styles.cm_halftone_polygons.shaders.uniforms.dot_scale = 5 - value;
            scene.requestRedraw();
        });
        gui.add(style_controls, 'scale', 1, 100).onChange(function(value) {
            mousetrap = false; // don't animate the shader during value change
            scene.styles.cm_halftone_polygons.shaders.uniforms.dot_frequency = logslider(100 - value);
            scene.requestRedraw();
        });
    }

    // http://stackoverflow.com/a/846249/738675
    function logslider(position) {
      // position will be between 0 and 100
      var minp = 1;
      var maxp = 100;

      // The result should be between 100 an 10000000
      var minv = Math.log(10000);
      var maxv = Math.log(10000000);

      // calculate adjustment factor
      var scale = (maxv-minv) / (maxp-minp);

      return Math.exp(minv + scale*(position-minp));
    }


    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
            // put gui on top
            document.getElementsByClassName('ac')[0].style.zIndex = 10000;
        });
        layer.addTo(map);

    });

    return map;
}());

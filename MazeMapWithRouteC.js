// The map
const map = new Mazemap.Map({
  container: "map",
  campuses: 341,
  center: { lng: -2.7922321418786713, lat: 54.01036998271985 },
  zoom: 18,
  zLevel: 1,
});

var route_controller;

// Add map navigation controls
map.addControl(new Mazemap.mapboxgl.NavigationControl(), 'bottom-right');

//switches used for methods
var trigger = true;
var first = true;

//InfoLab
var start = { lngLat: { lng: -2.7900043, lat: 54.003701 } };
//LICA
var end = { lngLat: { lng: -2.7877019, lat: 54.0044 } };

//rest of functions wait for the map to load
map.on("load", () => {
  //Route Controller
  route_controller = new Mazemap.RouteController(map, {
    routeLineColorPrimary: "#0099EA",
    routeLineColorSecondary: "#888888",
  });

  //BlueDot
  const blueDot = new Mazemap.BlueDot({
    map: map
  })
    .setAccuracy(10)
    .show();

  //Location Controller
  const locationController = new Mazemap.LocationController({
    blueDot: blueDot,
    map: map
  });

  //Will set the initial route
  set_route(start, end);

  //Follow will always centre on the BlueDot as it moves
  locationController.setState('follow');

  //Listens for change in users location
  const watchID = navigator.geolocation.watchPosition(position => {
    console.log("updated");

    var { latitude, longitude } = position.coords;

    locationController.updateLocationData({
      lngLat: {
        lng: longitude,
        lat: latitude
      }
    });

    if (trigger) {
      set_route({ lngLat: { lng: longitude, lat: latitude } }, end);
      trigger = false;
      resetTrigger();
    }
  });
});

function resetTrigger() {
  setTimeout(() => {
    trigger = true;
  }, 5000);
}

function set_route(p1, p2) {
  // Remove previous route if present
  route_controller.clear();

  // Get route and show if succesful
  Mazemap.Data.getRouteJSON(p1, p2).then((geojson) => {
    //download("geojson", geojson);

    // Set the route
    route_controller.setPath(geojson);

    /*
    remove to print the data about route
    printRouteData(geojson);
    */

    //Fit the map bounds to the path bounds
    //Only call when first setting route
    if (first) {
      first = false;
      let bounds = Mazemap.Util.Turf.bbox(geojson);
      map.fitBounds(bounds, { padding: 100 });
    }
  }).catch((e) => {
    console.log(e);
  });
};

/*
DEBUG FUNCTIONS
*/
function download(filename, data) {
  var jsonified = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  var a = document.createElement("a");
  a.setAttribute("href", jsonified);
  a.setAttribute("download", `${filename}.json`);
  a.click();
  a.remove();
  console.log(`downloaded ${filename}`);
}

//get route data
function printRouteData(route) {
  //get features array
  const features = route.features;
  features.forEach(feature => {
    //get coordintes
    var coords = feature.geometry.coordinates;
    coords.forEach(coord => {
      //check type is 'point' (point = stairs, etrance, etc.)
      if (feature.geometry.type !== "Point") {
        console.log("lng: " + coord[0] + " lat: " + coord[1]);
        /*
        uncomment to draw all the extracted points
        drawPoint(coord);
        */
        /*
        can add code here to do stuff with the extracted coordinates
        */
      }
    });
  });
}

function drawPoint(coord) {
  var marker = new Mazemap.MazeMarker({
    zLevel: 0
  })
    .setLngLat(coord)
    .addTo(map);
}



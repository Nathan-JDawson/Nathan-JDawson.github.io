// The map
const map = new Mazemap.Map({
  container: "map",
  campuses: 341,
  center: { lng: -2.7922321418786713, lat: 54.01036998271985 },
  zoom: 18,
  zLevel: 1,
});

let lng;
let lat;

/*navigator.geolocation.getCurrentPosition(function(position){
lng = position.coords.longitude;
lat = position.coords.latitude;

console.log(lng);
console.log(lat);
})*/


// Add map navigation controls
map.addControl(new Mazemap.mapboxgl.NavigationControl());

// Route controller will be set after the map has loaded
let route_controller;
var trigger = true;

map.on("load", () => {
  route_controller = new Mazemap.RouteController(map, {
      routeLineColorPrimary: "#0099EA",
      routeLineColorSecondary: "#888888",
  });
            
//BlueDot
  const blueDot = new Mazemap.BlueDot({
      map : map
  })
    .setAccuracy(10)
    .show();
    
  var locationController = new Mazemap.LocationController({
    blueDot: blueDot,
    map: map
  });

  //InfoLab
  var start = {lngLat: {lng: -2.78493000000000031, lat: 54.0054}};
  //LICA
  var end = {lngLat: {lng: -2.785000185291551, lat: 54.008211570424336}, zLevel: 2};
  set_route(end, start);

  locationController.setState('follow'); 
  const watchId = navigator.geolocation.watchPosition(position => {
      
    var { latitude, longitude } = position.coords;

    locationController.updateLocationData({
      lngLat: {
        lng: longitude,
        lat: latitude
      }
    });
      
    if(trigger) {
        set_route({ lngLat: { lng: longitude, lat: latitude }, zLevel: map.zLevel }, end);
        trigger = false;
        resetTrigger();
    }
  });
  //map.flyTo({center:{lng : longitude, lat : latitude}, zoom: 18});
  // Show a map centered at latitude / longitude.

  /*navigator.geolocation.getCurrentPosition(function(position){
    lng = position.coords.longitude;
    lat = position.coords.latitude;
  */

  

});

function resetTrigger(){
  setTimeout(()=>{
    trigger = true;
    console.log("reset");
  }, 5000);
}

function set_route(p1, p2){
  // Remove previous route if present
  route_controller.clear();

  // Get route and show if succesful
  Mazemap.Data.getRouteJSON(p1, p2).then((geojson) => {
      //download("geojson", geojson);

      // Set the route
      route_controller.setPath(geojson);
      printRouteData(geojson);

      // Fit the map bounds to the path bounds
      let bounds = Mazemap.Util.Turf.bbox(geojson);
      map.fitBounds(bounds, { padding: 100 });
  });
};

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
function printRouteData(route){
  //get features array
  const features = route.features;
  features.forEach(feature => {
    //get coordintes
    var coords = feature.geometry.coordinates;
    coords.forEach(coord => {
      //check type is 'point' (point = stairs, etrance, etc.)
      if(feature.geometry.type !== "Point"){
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

function drawPoint(coord){
  var marker = new Mazemap.MazeMarker({
    zLevel : 0
  })
  .setLngLat(coord)
  .addTo(map);
}



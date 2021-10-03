const platform = new H.service.Platform({ apikey: 'D_6Bq02OZ4b2BBwXAJYFlZ6yHIixKl0Q5ym9lUlNhxg' });
const defaultLayers = platform.createDefaultLayers();
const map = new H.Map(document.getElementById('map'),
    defaultLayers.vector.normal.map, {
    center: { lat: 15.34649, lng: 75.14553 },
    zoom: 11,
    pixelRatio: window.devicePixelRatio || 1
});

//UI controls
window.addEventListener('resize', () => map.getViewPort().resize());
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
const ui = H.ui.UI.createDefault(map, defaultLayers);
var lat=0, lng=0;
var marker = new H.map.Marker({ lat, lng });

//Search your Location
function SYL() {
    const searchText = document.getElementById('search').value;
    const geocoder = platform.getGeocodingService();
    geocoder.geocode({ searchText }, result => {
        const location = result.Response.View[0].Result[0].Location.DisplayPosition;
        const { Latitude : lat, Longitude: lng } = location;
        marker.setGeometry({lat, lng});
        map.addObject(marker);
        map.setCenter({lat, lng});
        map.setZoom(14);
    });
}

//get location by clicking on the map
function setUpClickListener(map) {
    var lat, lng;
    map.addEventListener('tap', function (evt) {
        var coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
        lat = Math.abs(coord.lat.toFixed(4)); 
        lng = Math.abs(coord.lng.toFixed(4));
        RGC(lat, lng);
        marker.setGeometry({ lat, lng });
    });
}

var service = platform.getSearchService();
var bubble, bubblex;
function RGC(x, y) {
    service.reverseGeocode({
        at: ''+x+','+y+''
    }, (result) => {
        result.items.forEach((item) => {
                bubble = new H.ui.InfoBubble(item.position, {
                content: item.address.label+', lat:'+x+', lng:'+y 
            });
            ui.removeBubble(bubblex);
            ui.addBubble(bubble);
            bubblex = bubble;
        });
    }, alert);
}
setUpClickListener(map);

//automatic location using GPS
function updatePosition (event) {
    var HEREHQcoordinates = {
        lat: event.coords.latitude,
        lng: event.coords.longitude,
    };
    marker.setGeometry(HEREHQcoordinates);
    marker.draggable = true;
    map.addObject(marker);
    map.setCenter(HEREHQcoordinates);
    map.setZoom(14);
    addDraggableMarker(map, behavior);
}

//draggable marker
function addDraggableMarker(map, behavior){
    map.addEventListener('dragstart', function(ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            var targetPosition = map.geoToScreen(target.getGeometry());
            target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
            behavior.disable();
        }
    }, false);

    map.addEventListener('dragend', function(ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
            behavior.enable();
        }
    }, false);

    map.addEventListener('drag', function(ev) {
        var target = ev.target,
        pointer = ev.currentPointer;
        if (target instanceof H.map.Marker) {
            target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
        }
    }, false);
}
L.ALS.System.initializeSystem();

let map = L.map("map4", {
	preferCanvas: true,
	keyboard: false,
	zoomControl: false,
}).setView([51.5, 2], 7);

let layerSystem = new L.ALS.System(map, {
	enableProjects: false,
	enableExport: false,
	enableBaseLayerSwitching: false,
	enableSettings: false,
	useOnlyThisLayer: L.ALS.SingleLayer,
	position: "topright",
}).addTo(map);

new L.ALS.ControlZoom({position: "topleft"}).addTo(map);

let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19});
layerSystem.addBaseLayer(baseLayer, "OSM");
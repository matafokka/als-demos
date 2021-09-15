L.ALS.System.initializeSystem();

let map = L.map("map2", {
	preferCanvas: true,
	keyboard: false,
	// We won't add zoom control because toolbar already has them. On mobile, zoom control will be added by ALS.
	// This behavior can be customized by ALS options.
	zoomControl: false,
}).setView([0, 3], 1);

let layerSystem = new L.ALS.System(map, {
	enableToolbar: true, // Setting this option to true will enable the toolbar
	enableHistory: true,
}); // Note: we don't call addTo() when we're using toolbar because we don't need another menu button

let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19});
layerSystem.addBaseLayer(baseLayer, "OSM");
layerSystem.addLayerType(L.ALS.MyLayer);
layerSystem.addLayerType(L.ALS.RectLayer);
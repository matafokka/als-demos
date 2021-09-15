// In this demo, we'll use cool ALS class which allows us to render lots of labels on the map.
// We'll fill the map with labels with their positions.

L.ALS.Locales.addLocaleProperties("English", {
	"labelsLayer": "Labels Layer",
	"drawnLabels": "Number of drawn labels",
});

L.ALS.Locales.addLocaleProperties("Русский", {
	"labelsLayer": "Слой с Надписями",
	"drawnLabels": "Отрисовано надписей"
});

L.ALS.LabelsLayerWizard = L.ALS.Wizard.extend({displayName: "labelsLayer"});

L.ALS.LabelsLayerSettings = L.ALS.Settings.extend({
	initialize: function () {
		L.ALS.Settings.prototype.initialize.call(this);
		this.addWidget(new L.ALS.Widgets.SimpleLabel("id", "labelsLayer").setStyle("message"), "labelsLayer");
	}
});

L.ALS.LabelsLayer = L.ALS.Layer.extend({

	init: function () {
		// Random backgrounds for labels
		this._backgrounds = ["#572626", "#866b41", "#265818", "#3b7f6f", "#346278", "#653584", "#79095d"];

		// This will render the labels. The argument determines whether layer should automatically redraw labels.
		// It's recommended to set it to false, if you'll add and remove labels repeatedly which we'll do.
		this._labelsLayer = new L.ALS.LeafletLayers.LabelLayer(false);
		this.addLayers(this._labelsLayer);

		this._label = new L.ALS.Widgets.ValueLabel("id", "drawnLabels");
		this.addWidget(this._label);

		// Add event listener to the map which will listen to moving and resizing
		this.addEventListenerTo(this.map, "moveend resize", "_generateLabels");
		this._generateLabels(); // Run it for the first time
	},

	_generateLabels: function () {
		this._labelsLayer.deleteAllLabels();
		let bounds = this.map.getBounds();
		let toLat = bounds.getSouth(), toLng = bounds.getEast(), step = 5 / this.map.getZoom(), count = 0;
		for (let lat = bounds.getNorth(); lat >= toLat; lat -= step) {
			for (let lng = bounds.getWest(); lng <= toLng; lng += step) {
				// Add a label to the labels layer.
				// First argument is an ID which we can skip, and layer will generate it for us.
				// Second argument is label position.
				// Third argument is label text.
				// Fourth argument is display options.
				this._labelsLayer.addLabel("", [lat, lng], lat.toFixed(3) + "\n" + lng.toFixed(3),
					{
						origin: "center",
						textAlign: "center",
						fontColor: "white",
						backgroundColor: this._backgrounds[Math.floor(Math.random() * this._backgrounds.length)],
					});
				count++;
			}
		}
		this._labelsLayer.redraw(); // Redraw the labels. You don't need to call it, if you're using automatic redraw.
		this._label.setValue(count);
	},

	statics: {
		wizard: L.ALS.LabelsLayerWizard,
		settings: new L.ALS.LabelsLayerSettings(),
	}

});

L.ALS.System.initializeSystem();

let map = L.map("map6", {
	preferCanvas: true,
	keyboard: false,
	zoomControl: false,
}).setView([51, 2], 7);

let layerSystem = new L.ALS.System(map, {
	enableProjects: false,
	enableExport: false,
	enableBaseLayerSwitching: false,
	enableSettings: false,
	useOnlyThisLayer: L.ALS.LabelsLayer,
	position: "topright",
}).addTo(map);

new L.ALS.ControlZoom({position: "topleft"}).addTo(map);

let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, minZoom: 1});
layerSystem.addBaseLayer(baseLayer, "OSM");
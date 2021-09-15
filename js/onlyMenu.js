// In this demo, we'll create an ALS instance with only one layer, without settings, undo/redo and projects.
// However, we'll still localize it. Every ALS instance shares the same settings which also applies to the locale.
// You can open settings through the previous example, change locale and see that this example changes too.
// The layer in the demo will have a couple of shapes. Users can change shapes' colors.

// Add locale properties
L.ALS.Locales.addLocaleProperties("English", {
	"singleLayer": "Single Layer",
	"polygonColor": "Polygon color:",
	"triangleColor": "Triangle color:",
	"circleColor": "Circle color:",
	"circleRadius": "Circle radius",
});

L.ALS.Locales.addLocaleProperties("Русский", {
	"singleLayer": "Одиночный Слой",
	"polygonColor": "Цвет полигона:",
	"triangleColor": "Цвет треугольника:",
	"circleColor": "Цвет круга:",
	"circleRadius": "Радиус круга:",
});

// You don't have to extend default wizard and settings if you don't have settings anywhere.
// We have settings, so we gotta override it.
L.ALS.SingleLayerWizard = L.ALS.Wizard.extend({ displayName: "singleLayer" });

L.ALS.SingleLayerSettings = L.ALS.Settings.extend({
	initialize: function () {
		this.addWidget(new L.ALS.Widgets.SimpleLabel("id", "singleLayer"), "singleLayer");
	}
})

L.ALS.SingleLayer = L.ALS.Layer.extend({

	init: function () {
		L.ALS.Layer.prototype.init.call(this);

		this._polygon = L.polygon([[51, 0], [51, 1], [51.5, 2], [52, 1], [52, 0]]);
		this._triangle = L.polygon([[51, 2], [51, 3], [52, 3]]);
		this._circle = L.circle([51.5, 4], 1);
		this.addLayers(this._polygon, this._triangle, this._circle);

		this._objectNames = ["polygon", "triangle", "circle"]; // So we can iterate over widgets

		this.addWidgets(
			new L.ALS.Widgets.Color("polygonColor", "polygonColor", this, "_applyProperties").setValue("#fff300"),
			new L.ALS.Widgets.Color("triangleColor", "triangleColor", this, "_applyProperties").setValue("#ff8c00"),
			new L.ALS.Widgets.Color("circleColor", "circleColor", this, "_applyProperties").setValue("#ff0000"),
			new L.ALS.Widgets.Number("circleRadius", "circleRadius", this, "_applyProperties")
				.setValue(50000).setMin(50000).setMax(500000).setStep(10000),
		);
		this._applyProperties();
	},

	// We'll set all the stuff in one function to simplify things
	_applyProperties: function () {
		// Set colors in one loop
		for (let name of this._objectNames) {
			let color = this.getWidgetById(name + "Color").getValue();
			this["_" + name].setStyle({
				color: color,
				fillColor: color,
			});
		}

		// Set circle radius
		this._circle.setRadius(this.getWidgetById("circleRadius").getValue());
	},

	statics: {
		wizard: L.ALS.SingleLayerWizard,
		settings: new L.ALS.Settings(),
	}

});

L.ALS.System.initializeSystem();

let map = L.map("map3", {
	preferCanvas: true,
	keyboard: false,
	zoomControl: false,
}).setView([51.5, 2], 7);

let layerSystem = new L.ALS.System(map, {
	// Disable button we don't need: project-related and settings
	enableProjects: false,
	enableSettings: false,
	position: "topright",

	// Make ALS use only our single layer
	useOnlyThisLayer: L.ALS.SingleLayer,
}).addTo(map);

new L.ALS.ControlZoom({position: "topleft"}).addTo(map);

let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19});
layerSystem.addBaseLayer(baseLayer, "OSM"); // Add your base layers to the system
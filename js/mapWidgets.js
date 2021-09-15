// In this demo, we'll add widgets to the map and display their values in the layer menu

L.ALS.Locales.addLocaleProperties("English", {
	"mapWidgetsLayer": "Map Widgets Layer",
	"dummyNumber": "Dummy number",
	"dummyText": "Dummy text",
	"dummyColor": "Dummy color",
	"dummyText2": "Dummy text 2",
});

L.ALS.Locales.addLocaleProperties("Русский", {
	"mapWidgetsLayer": "Слой с виджетами на карте",
	"dummyNumber": "Число",
	"dummyText": "Текст",
	"dummyColor": "Цвет",
	"dummyText2": "Текст 2",
});

L.ALS.MapWidgetsWizard = L.ALS.Wizard.extend({displayName: "mapWidgetsLayer"});

L.ALS.MapWidgetsSettings = L.ALS.Settings.extend({
	initialize: function () {
		L.ALS.Settings.prototype.initialize.call(this);
		this.addWidget(new L.ALS.Widgets.SimpleLabel("id", "mapWidgetsLayer").setStyle("message"), "mapWidgetsLayer");
	}
});

L.ALS.MapWidgetsLayer = L.ALS.Layer.extend({

	init: function () {
		// Create a widgetable that will be added to the map and contain our widgets.
		// First argument is a position.
		// Second argument is an origin, i.e. which point of the widgetable will be at given position.
		this._mapWidgetable = new L.ALS.LeafletLayers.WidgetLayer([51, 0], "center");
		this._mapWidgetable.addWidgets(
			new L.ALS.Widgets.Number("number", "dummyNumber", this, "_updateMenu").setValue(0),
			new L.ALS.Widgets.Text("text", "dummyText", this, "_updateMenu").setValue("Write something here..."),
			new L.ALS.Widgets.Color("color", "dummyColor", this, "_updateMenu").setValue("#0088ff"),
		);

		// If there's only one widget, widgetable will remove any padding.
		// By the way, all leaflet layers have aliases at L namespace.
		this._mapWidgetableWithOneWidget = new L.WidgetLayer([51, 4], "topLeft");
		this._mapWidgetableWithOneWidget.addWidget(
			new L.ALS.Widgets.Text("text", "dummyText2", this, "_updateMenu").setValue("Whoa, only one widget!")
		);

		this.addLayers(this._mapWidgetable, this._mapWidgetableWithOneWidget);

		this.addWidgets(
			// Value labels are good not only for formatting values, but for text with additional label
			new L.ALS.Widgets.ValueLabel("number", "dummyNumber"),
			new L.ALS.Widgets.ValueLabel("text", "dummyText"),
			new L.ALS.Widgets.ValueLabel("color", "dummyColor"),
			new L.ALS.Widgets.Divider(),
			new L.ALS.Widgets.ValueLabel("text2", "dummyText2"),
		);
		this._updateMenu();
	},

	_updateMenu: function () {
		let ids = ["number", "text", "color"];
		for (let id of ids)
			this.getWidgetById(id).setValue(this._mapWidgetable.getWidgetById(id).getValue());
		this.getWidgetById("text2").setValue(this._mapWidgetableWithOneWidget.getWidgetById("text").getValue());
	},

	statics: {
		wizard: L.ALS.MapWidgetsWizard,
		settings: new L.ALS.MapWidgetsSettings(),
	}

});

L.ALS.System.initializeSystem();

let map = L.map("map5", {
	preferCanvas: true,
	keyboard: false,
	zoomControl: false,
}).setView([51, 2], 7);

let layerSystem = new L.ALS.System(map, {
	enableProjects: false,
	enableExport: false,
	enableBaseLayerSwitching: false,
	enableSettings: false,
	useOnlyThisLayer: L.ALS.MapWidgetsLayer,
	position: "topright",
}).addTo(map);

new L.ALS.ControlZoom({position: "topleft"}).addTo(map);

let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19});
layerSystem.addBaseLayer(baseLayer, "OSM");
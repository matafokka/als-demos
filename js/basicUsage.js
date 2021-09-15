// In this example we'll demonstrate basic workflow with ALS. Example is a bit messy, so buckle up.
// We have everything in one file for better understanding. Please, don't do like that, put each class in its own file.

require("leaflet-advanced-layer-system"); // Import ALS before doing anything. It should be imported only once.

/////////////////////
//     Locales     //
/////////////////////

// The first thing we have to do is to set up locales.
// Each locale contains so-called locale properties - strings that will be displayed on the page.
// When we'll try to set text to some kind of element, we'll use locale properties to localize our app.

// English locale is added by default. Others should be added like this:
L.ALS.Locales.AdditionalLocales.Russian(); // Add additional locales BEFORE defining your custom properties!

// Locales not included in ALS can be defined in a following manner (we won't add this "locale" to our project though):
L.ALS.Locales.AdditionalLocales.MyLocale = function () {
	L.ALS.Locales["My Locale Name"] = {
		// This stuff is needed for locale detection
		language: "Two letters language code",
		region: "Two letters region code",

		// Then your locale properties go
		myLocaleProperty: "Property Value",
	}
}

// Define custom locale properties for English
L.ALS.Locales.addLocaleProperties("English", {
	polygonSize: "Polygon size:",
	uselessNumber: "Useless number:",
	numberPlushPolygonSize: "Number + polygon size =",
	calledBy: "Called by widget",
	fillColor: "Fill color:",
	strokeColor: "Stroke color:",
	addCircle: "Add Circle",
	thisIsPolygon: "This is polygon!",
	rectLayer: "Rectangle Layer",
	aboutText: "Welcome to ALS demos!",
	demoLayer: "Demo Layer",
	settingsTextInput: "Text to display in the menu:"
});

// Define custom locale properties for Russian
L.ALS.Locales.addLocaleProperties("Русский", {
	polygonSize: "Размер полигона:",
	uselessNumber: "Бесполезное число:",
	numberPlushPolygonSize: "Число + размер полигона =",
	calledBy: "Вызвано виджетом",
	fillColor: "Цвет заливки:",
	strokeColor: "Цвет обводки:",
	addCircle: "Добавить Круг",
	thisIsPolygon: "Это полигон!",
	rectLayer: "Слой с прямоугольником",
	aboutText: "Добро пожаловать на сайт демонстрации ALS!",
	demoLayer: "Демонстрационный слой",
	settingsTextInput: "Текст для отображения в меню:"
});

/////////////////////
//   First layer   //
/////////////////////

// Create a wizard which you can see in a "New layer" window.
// Widgets' values from the wizard will be passed to the layer's constructor.
L.ALS.MyLayerWizard = L.ALS.Wizard.extend({

	// This text will be displayed in both wizard and settings windows

	// Here we'll use locale properties for the first time. We can either pass text itself or a locale property.
	// From now on if you'll see camelCaseStringLikeThis think about locale properties.

	displayName: "demoLayer",

	initialize: function () {
		L.ALS.Wizard.prototype.initialize.call(this); // Call parent constructor

		// Add a widget which will determine polygon's size to the wizard using addWidget().
		// This will be the only one useful widget. The other widgets are for demonstration purposes.
		this.addWidget(
			// The first constructor argument is always an ID. You can get any widget whenever you want by using its ID.
			// The second argument almost always is a label text. We'll using a locale property instead.
			// The last two arguments are for a callback. We don't pass a function itself, instead, we pass an object
			// that contains a function and a function name. It's needed for a serialization.

			new L.ALS.Widgets.Number("polygonSize", "polygonSize", this, "_demoCallback")
				.setValue(1).setMin(1).setMax(5)
			// We can create and modify a widget in a chain. Each method (except for getters) returns the widget.
			// Of course, you can assign it to the variable and use it later in your code.
		);

		// We can also add multiple widgets at once:
		this.addWidgets(
			new L.ALS.Widgets.Number("myNumberId", "uselessNumber", this, "_demoCallback").setValue(0),
			new L.ALS.Widgets.SimpleLabel("myLabelId", "").setTextAlign("center"),
		);
		this.getWidgetById("myNumberId").callCallback(); // Call a callback to update the label
	},

	// Implement number widget's' callback. Callback accepts widget which called this callback.
	_demoCallback: function (widget) {
		// Get widgets values
		let number = this.getWidgetById("myNumberId").getValue();
		let polygonSize = this.getWidgetById("polygonSize").getValue();

		// Let's display both of these values in a label
		this.getWidgetById("myLabelId")
			// L.ALS.locale contains all locale properties. Use it only when you want to display a string once.
			.setValue(`${L.ALS.locale.numberPlushPolygonSize} ${number + polygonSize}.
			${L.ALS.locale.calledBy} ${widget.id}.`)
			.setStyle((polygonSize > number) ? "success" : "message"); // Set label style depending on our numbers
	},

});

// Create settings for the layer. It'll contain custom polygon default colors.
// Settings for each layer are displayed in the settings window under the item named after the layer (see below).
// Settings also will be passed to the layer's constructor.
// When settings will change, L.ALS.Layer.applyNewSettings() method will be called.
L.ALS.MyLayerSettings = L.ALS.Settings.extend({

	initialize: function () {
		L.ALS.Settings.prototype.initialize.call(this); // Call parent constructor

		// Add default polygon fill and stroke colors.
		// Note the second argument, it's default widget value, so user can set it if they've messed up the settings.
		this.addWidget(new L.ALS.Widgets.Color("fillColor", "fillColor"), "#730000");

		// In settings, we can't use addWidgets() because of default values. So just call addWidget() multiple times.
		this.addWidget(new L.ALS.Widgets.Color("strokeColor", "strokeColor"), "#730060");

		// This text will be displayed in the layer menu and updated whenever user updates settings.
		this.addWidget(new L.ALS.Widgets.Text("text", "settingsTextInput"), "Bla-bla-bla");
	}

});

// Create layer itself
L.ALS.MyLayer = L.ALS.Layer.extend({

	defaultName: "Polygon and Circles", // Default layer name

	// Note: we're overriding init() instead of initialize(). Do NOT override initialize()!
	init: function (wizardResults, settings) {

		// If you need to copy settings to layer's properties, use copySettingsToThis().
		// It won't change the original settings object, so you can use both.
		this.copySettingsToThis(settings);

		// Build a menu for the layer.
		// It'll contain polygon colors which default values will be from the settings.
		// We'll assign widgets to the private fields for faster and easier access.

		this._fillColor = new L.ALS.Widgets.Color("fill", "fillColor", this, "_applyPolygonColors")
			.setValue(settings.fillColor);
		this._strokeColor = new L.ALS.Widgets.Color("stroke", "strokeColor", this, "_applyPolygonColors")
			.setValue(settings.strokeColor);

		// This button will add circles.
		this._circleButton = new L.ALS.Widgets.Button("button", "addCircle", this, "_addCircle");

		// Remember text input in the settings? This label will display it.
		this._label = new L.ALS.Widgets.SimpleLabel("label", "");

		this.addWidgets(this._fillColor, this._strokeColor, this._circleButton, this._label);

		// Add the polygon to the layer accounting the size from the wizard. Polygon will be resized by longitude.
		this._polygon = L.polygon([
			[73, -6 * wizardResults.polygonSize], [31, -15 * wizardResults.polygonSize],
			[4, 42 * wizardResults.polygonSize], [19, 87 * wizardResults.polygonSize],
			[69, 64 * wizardResults.polygonSize], [62, 34 * wizardResults.polygonSize],
		]);

		this._circles = []; // Contains circles' geometries
		this._currentCirclePos = 0; // Contains last circle's longitude

		this.addLayers(this._polygon); // Add polygon to the map. Use only L.ALS.Layer API for managing map objects!
		this.applyNewSettings(settings); // Apply the settings
		this._applyPolygonColors(); // Apply polygon colors
	},

	// Override method for applying new settings
	// You'll not necessary need to apply settings every time they've changed.
	// You may want to leave this method as it is, if your settings contain only initial parameters.
	// Apply them at init() instead.
	applyNewSettings: function (settings) {
		this._label.setValue(settings.text);
	},

	// Callback for applying polygon colors
	_applyPolygonColors: function () {
		this._polygon.setStyle({
			fillColor: this._fillColor.getValue(),
			color: this._strokeColor.getValue(),
		});

		// Since we're gonna implement serialization, we might as well allow users to undo actions by writing them
		// to the history
		this.writeToHistory();
	},

	// This method is called whenever project is being exported. It should return a GeoJSON object.
	// By default, it combines all layers on the map and returns them.
	// You need to override this method when you want to export only specific layers.
	// For our example, we'll return only polygon's geometry.
	toGeoJSON: function () {
		return this._polygon.toGeoJSON();
	},

	// Now we'll look at serialization and deserialization.
	// It allows users to save and load projects. Also used for undo and redo.

	// This function only generates random size and calls a "worker" function that will actually add a circle
	// We split code like that, so we'll be able to easily restore serialized circles. We'll dig into that later.
	_addCircle: function () {
		let size = Math.random() * 500000 + 200000;
		this._circles.push(size); // this._circles will be deserialized automatically
		this._addCircleWorker(size);
		this.writeToHistory();
	},

	_addCircleWorker: function (size) {
		this._currentCirclePos += size / 100000 + 5; // Increase current position by object size and add some padding
		this.addLayers(
			L.circle([0, this._currentCirclePos], {
				radius: size,
				fillColor: "blue",
				color: "blue",
			}));
	},

	// The default algorithm is pretty smart and able to serialize almost everything except HTMLElements and some
	// really messed up classes. It'll even skip classes extending L.Layer and L.Map for this reason.
	// We have to serialize such classes manually.

	// The key is to represent such objects as simple types and structures such as numbers, arrays or plain objects.
	// For example, it can be an array of vertices or objects with geometry and custom properties.

	// Sometimes you don't even have to do anything. In our case, polygon will be reconstructed at the init(), and
	// we already have circles sizes in array.

	// But if you have lots of objects which you can't put to ignore list, you might want to override serialization.
	// Let's demonstrate how to do that despite having perfect setup.

	// This method is called whenever serialization is required: when saving a project or when undo/redo is called.
	// seenObjects is passed by ALS, you need to pass it to any serialization method.
	serialize: function (seenObjects) {
		// Call parent's method. It'll serialize stuff like layer name, layer widgets and much more.
		let serialized = this.getObjectToSerializeTo(seenObjects);

		let serializedCircles = []; // Store circles in here

		// For each layer
		this.eachLayer((layer) => {
			if (layer instanceof L.Polygon) // We don't need polygons here
				return;

			// Push a plain object to the array which will contain circle size and position
			serializedCircles.push({
				size: layer.getRadius(),
				pos: layer.getLatLng(),
			});
		});

		// Add the circles to the serialized object. Properties added like that won't be deserialized automatically.
		serialized.serializedCircles = L.ALS.Serializable.serializeAnyObject(serializedCircles, seenObjects);
		return serialized; // Return serialized object
	},

	statics: {
		// Assign wizard and settings to the layer
		wizard: L.ALS.MyLayerWizard, // You should pass a class here
		settings: new L.ALS.MyLayerSettings(), // You should pass an instance here

		// Now let's break down deserialization which should restore all original objects from the serialized object

		// This method is called whenever deserialization is required: when loading a project or performing undo/redo.
		// Whoa, lots of arguments! Fortunately, we only have to pass them.
		deserialize: function (serialized, layerSystem, settings, seenObjects) {
			// Call parent's method and get the deserialized object. It's an instance of this layer.
			let deserialized = L.ALS.Layer.deserialize(serialized, layerSystem, settings, seenObjects);

			// If we didn't go the hard way, we would do this:
			// for (let size of deserialized._circles)
			//     deserialized._addCircleWorker(size);

			// Add circle layers. Manually added properties won't be deserialized automatically.
			// We have to call L.ALS.Serializable.deserialize() on every custom property, even on primitives.
			let circles = L.ALS.Serializable.deserialize(serialized.serializedCircles, seenObjects);
			for (let circle of circles) {
				deserialized.addLayers(
					L.circle(circle.pos, {
						fillColor: "blue",
						color: "blue",
						radius: circle.size,
					}));
			}

			// Restore last position
			if (circles.length !== 0)
				deserialized._currentCirclePos = circles[circles.length - 1].pos.lng;

			deserialized._applyPolygonColors(); // Widgets' values will be restored, but the callback won't be called
			return deserialized; // Return deserialized object
		}
	},

});

/////////////////////
//  Second layer   //
/////////////////////

// This layer will demonstrate interactivity. It'll have a rectangle that will change its color on click.
// It won't have serialization overrides because everything is represented by simple structures.
// Even though we don't need wizard or settings for this layer, it's always good to create placeholders.

function addRectLabel (widgetable) {
	widgetable.addWidget(new L.ALS.Widgets.SimpleLabel("id", "rectLayer").setStyle("message"));
}

L.ALS.RectLayerWizard = L.ALS.Wizard.extend({
	displayName: "rectLayer",
	initialize: function () {
		L.ALS.Wizard.prototype.initialize.call(this);
		addRectLabel(this);
	}
});

L.ALS.RectSettings = L.ALS.Settings.extend({
	initialize: function () {
		L.ALS.Settings.prototype.initialize.call(this);
		addRectLabel(this);
	}
});

L.ALS.RectLayer = L.ALS.Layer.extend({
	defaultName: "Interactive Rectangle",

	init: function () {
		L.ALS.Layer.prototype.init.call(this);
		this._colors = ["red", "green", "blue"];
		this._currentColor = 0;
		this._rect = L.rectangle([[0, 0], [70, 50]]);
		this.addLayers(this._rect);
		addRectLabel(this);

		// This method adds an event listener. Event listeners should be managed by L.ALS.Layer API, not by Leaflet!
		this.addEventListenerTo(this._rect, "click", "_changeColor");
		this._changeColor(); // Set initial color
	},

	_changeColor: function () {
		let color = this._colors[this._currentColor];
		this._rect.setStyle({
			fillColor: color,
			color: color,
		});
		this._currentColor = (this._currentColor === this._colors.length - 1) ? 0 : this._currentColor + 1;
	},

	statics: {
		wizard: L.ALS.RectLayerWizard,
		settings: new L.ALS.RectSettings(),
	}
});

/////////////////////
//    App setup    //
/////////////////////

L.ALS.System.initializeSystem(); // Initialize system. This method MUST be called after all Leaflet and ALS imports.

// Create a Leaflet map
let map = L.map("map1", {
	preferCanvas: true, // Improves performance
	keyboard: false, // Set this option to false! Otherwise, there'll be problems with L.ALS.LeafletLayers.WidgetLayer!
	zoomControl: false, // We'll add ALS control instead
}).setView([0, 3], 1);

// Create ALS instance and provide options which allows for customization
let layerSystem = new L.ALS.System(map, {
	// Add text to the "About" section in the settings. Here we'll also demonstrate how to localize HTML elements.
	// The first attribute specifies which locale property to use. Second attribute specifies property to localize.
	// You don't need to specify the second attribute if you want to put text in the element.
	// But you'll need it if you want to localize, for example, tooltips.
	aboutHTML: `<h1 data-als-locale-property="aboutText" data-als-locale-property-to-localize="innerHTML"></h1>`,
	enableHistory: true,
	position: "topright",
}).addTo(map);

new L.ALS.ControlZoom({position: "topleft"}).addTo(map); // Add ALS zoom control

// Create and add a base layer. You can create and add multiple base layers.
let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19});
layerSystem.addBaseLayer(baseLayer, "OSM");

layerSystem.addLayerType(L.ALS.MyLayer); // Register ALS layers
layerSystem.addLayerType(L.ALS.RectLayer);
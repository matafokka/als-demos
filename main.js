require("./js/basicUsage.js");
require("./js/basicUsageToolbar.js");
require("./js/onlyMenu.js");
require("./js/onlyMenuNoButtons.js");
require("./js/mapWidgets.js");
require("./js/fastLabels.js");

// Wrap code in spoilers
let maps = document.getElementsByClassName("map");
for (let map of maps) {
	let spoiler = new L.ALS.Widgets.Spoiler("spoiler-" + map.id, "Code");
	spoiler.container.classList.add("spoiler-no-padding");
	let code = document.getElementById("code-" + map.id);
	spoiler.wrapper.appendChild(code);
	spoiler.wrapper.classList.add("code-spoiler-wrapper");
	let mapContainer = map.parentElement;
	mapContainer.parentElement.insertBefore(spoiler.container, mapContainer.nextElementSibling);
}

document.getElementById("year").innerHTML = new Date().getFullYear();

L.ALS.System.initializeSystem();
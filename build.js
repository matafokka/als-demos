const persistify = require("persistify");
const babelify = require("babelify");
const postcss = require("postcss");
const prefixSelector = require("postcss-prefix-selector");
const csso = require("csso");
const fs = require("fs");
const fse = require("fs-extra");
const { JSDOM } = require("jsdom");
const hljs = require("highlight.js");

let dir = "dist/";

fse.emptyDirSync(dir);

let mainFile = "main.js";
persistify({
	entries: [mainFile],
})
	.transform("babelify", {
		presets: ["@babel/preset-env"],
		global: true,
	}).plugin("common-shakeify")
	.transform("uglifyify", {
		global: true,
		ie8: true,
	})
	.bundle().pipe(fs.createWriteStream(dir + mainFile));

let toCopy = [
	"leaflet-advanced-layer-system/dist/polyfills.js",
	"leaflet/dist/images",
];

for (let target of toCopy)
	fse.copy("node_modules/" + target, dir + target);

let alsFileDir = "node_modules/leaflet-advanced-layer-system/dist/css/";
let alsFiles = fs.readdirSync(alsFileDir);
for (let file of alsFiles) {
	if (!file.endsWith(".css"))
		fse.copy(alsFileDir + file, dir + file);
}

let files = ["node_modules/leaflet/dist/leaflet.css",
	"node_modules/leaflet-advanced-layer-system/dist/css/base.css",
	"node_modules/highlight.js/styles/atom-one-light.css",
	"styles.css",
];

(async function () {
	let css = ""
	for (let file of files)
		css += fs.readFileSync(file).toString();

	css += (await postcss([prefixSelector({
		prefix: ".als-dark",
	})]).process(
		fs.readFileSync("node_modules/highlight.js/styles/agate.css").toString(),
		{from: undefined}
	)).css;

	fs.writeFileSync(dir + "styles.css", csso.minify(css, {restructure: false}).css);
})();

let dom = new JSDOM(fs.readFileSync("index.html"));
let document = dom.window.document;

let scripts = ["basicUsage.js", "basicUsageToolbar.js", "onlyMenu.js", "onlyMenuNoButtons.js", "mapWidgets.js", "fastLabels.js"];

let descriptions = [
	"Example from the ALS docs",
	"Same example but with toolbar enabled",
	"Using ALS as a menu without some of the buttons",
	"Previous demo without any buttons. As simple as ALS could get.",
	"Map widgets",
	"Fast labels",
]

let mapId = 1;
let content = document.getElementById("content");
let insertBefore = document.getElementById("insert-before");
for (let script of scripts) {
	let code = document.createElement("div");
	code.className = "demo";
	code.id = "code-map" + mapId;

	let scriptContent = fs.readFileSync("js/" + script).toString();
	if (mapId === 1)
		scriptContent = scriptContent.replace("// L.ALS.System.initializeSystem();", "L.ALS.System.initializeSystem();");

	let codeContent = document.createElement("div");
	codeContent.innerHTML = hljs.highlight(scriptContent, {language: "js"}).value;

	let lineNumbers = document.createElement("div");
	lineNumbers.className = "line-numbers";
	let pos = 1, currentLine = 1;
	while (pos !== 0) {
		lineNumbers.innerHTML += currentLine + "\n";
		currentLine++;
		pos = scriptContent.indexOf("\n", pos) + 1;
	}

	code.appendChild(lineNumbers);
	code.appendChild(codeContent);

	let header = document.createElement("h1");
	header.innerHTML = descriptions[mapId - 1];
	let map = document.createElement("div");
	map.id = "map" + mapId;
	map.className = "map";

	for (let e of [header, map, code])
		content.insertBefore(e, insertBefore);

	mapId++;
}

let html = "<!DOCTYPE html><html lang='en'>" + document.getElementsByTagName("html")[0].innerHTML + "</html>";
fs.writeFileSync(dir + "index.html", html);
# ALS Demos

This is repository for the [ALS](https://github.com/matafokka/leaflet-advanced-layer-system) demos [website](https://matafokka.github.io/als-demos).

The rest of this readme is for building running this website.

# Building from sources

1. Clone the repo.
1. Run `npm install` to install dependencies
1. Run `npm run build` to build the website. The bundle will be in `dist` directory.

# Running on a local server through npm

Requires `http-server` package to be installed.

1. Run `npm run serve` to run on a local server.
1. Run `npm run build-and-serve` to build and run on a local server.

# Running on a custom server

Serve the `dist` directory and `dist/index.html` as an entry point.
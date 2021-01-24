# Animation using Bezier splines

This is my implementation of a Javascript app that animates models using Bezier splines to interpolate between keyframes. This is built on top of an earlier hierarchical model drawing web app which has its own [repo](https://github.com/brianzhu2001/hierarchical-models). 

Interpolation code can be found in [./code/src/classes/interpolation/ABezierInterpolator.js](./code/src/classes/interpolation/ABezierInterpolator.js).

## Running
Run the command `npm run start` in [./code/](./code/)

## Dependencies
AniGraph is included in this repo. This also requires node.js. All other dependencies can be found in [./code/package.json](./code/package.json) and can be installed by running `npm install` in [./code/](./code/) with node.js installed.

## Sources
AniGraph and the view component of the web app are written by Abe Davis. 

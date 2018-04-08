module.exports = {
  "globDirectory": ".",
  "globIgnores": [
    "**/service-worker.js",
    "node_modules/**/node_modules/**/*",
    "node_modules/**/bower_components/**/*"
  ],
  "globPatterns": [
    "js/*",
    "css/*",
    "index.html",
    "manifest.json",
    "node_modules/@power-elements/**/*.js",
    "node_modules/@polymer/lit-element/*.js",
    "node_modules/lit-html/lib/lit-extended.js",
    "node_modules/lit-html/lib/until.js",
    "bower_components/good-map/good-map.js",
  ],
  swSrc: 'service-worker.src.js',
  swDest: 'service-worker.js',
};

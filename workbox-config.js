module.exports = {
  "globDirectory": ".",
  "globIgnores": [
    "js/idb-keyval.js",
    "**/service-worker.js",
    "node_modules/**/node_modules/**/*",
    "node_modules/**/bower_components/**/*"
  ],
  "globPatterns": [
    "css/*",
    "index.html",
    "manifest.json"
  ],
  swSrc: 'service-worker.src.js',
  swDest: 'service-worker.js',
};

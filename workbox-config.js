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
    "manifest.json"
  ],
  swSrc: 'service-worker.src.js',
  swDest: 'service-worker.js',
};

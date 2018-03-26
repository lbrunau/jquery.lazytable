/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/lib/lazyTable.js":
/*!******************************!*\
  !*** ./src/lib/lazyTable.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return LazyTable; });\n/* harmony import */ var _tableRowIterator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tableRowIterator.js */ \"./src/lib/tableRowIterator.js\");\n\n\nfunction LazyTable(options) {\n\t/*\n\t * Relevant DOM objects.\n\t */\n\tconst that = this;\n\tconst table = this.find('table');\n\tconst tableBody = this.find('table tbody');\n\n\t\n\t/*\n\t * Init settings.\n\t */\n\tconst defaults = {\n\t\t\tdebug: false,         // output console logs\n\t\t\ttrHeight: 0,          // height of a single row - set to 0 for automatic determination\n\t\t\tdata: [],             // raw data\n\t\t\tgenerator: function(row) { return '<tr><td>' + row.join('</td><td>') + '</td></tr>'; }, // function to turn array into html code for table row\n\t\t\tstartIndex: 0,        // initially centered element\n\t\t\tkeepExisting: true,   // if true, rows will not be deleted when getting out of visible area \n\t\t\tprefetch: 0,          // number of rows by which to extend visible area\n\t\t\tanimationCalcTime: 3, // milliseconds\n\t\t\tappendFn: function(rows) {\n\t\t\t\ttableBody.append(rows.join()); \n\t\t\t},\n\t\t\tprependFn: function(rows) { \n\t\t\t\ttableBody.prepend(rows.join()); \n\t\t\t},\n\t\t\tdeleteFn: function(startIndex, endIndex) { \n\t\t\t\ttableBody.children().slice(startIndex, endIndex).remove();\n\t\t\t},\n\t\t\tonInit: null,         // callback function - will be called after initialization has finished\n\t\t\tonRedraw: null        // callback function - will be called after rows have been added or removed\n\t};\n\tconst settings = $.extend({}, defaults, options);\n\t\n\t\n\t/*\n\t * Init plugin-global variables.\n\t */\n\t/* Seekable Iterators over data */\n\tconst nextIter = new _tableRowIterator_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](settings.generator, settings.data);\n\tnextIter.setCurrent(settings.startIndex);\n\tconst prevIter = nextIter.clone();\n\t\n\t/* Flag to indicate that a resize event is being worked on already. */\n\tvar resizeAnimationWorking = false;\n\t\n\t/* The currently focused index - to be refocused on resize. */\n\tvar focusedIndex = false;\n\t\n\t/* Flag to indicate a table reset (restart). */\n\tvar reset = false;\n\n\t\n\t/*\n\t * Wait until at least one row is being drawn.\n\t */\n\tconst waitForRow = function() {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tvar tries = 1;\n\t\t\tconst wait = function() {\n\t\t\t\tconst rows = tableBody.children();\n\t\t\t\tif(rows.length > 0) {\n\t\t\t\t\t// wait one frame before resolving\n\t\t\t\t\twindow.setTimeout(function() { resolve(rows.get(0)); }, 16);\n\t\t\t\t} else if(tries++ < 10){\n\t\t\t\t\t// retry\n\t\t\t\t\twindow.setTimeout(wait, 100);\n\t\t\t\t} else {\n\t\t\t\t\treject();\n\t\t\t\t}\n\t\t\t};\n\t\t\twait();\n\t\t});\n\t};\n\n\t\n\t/*\n\t * Create a build animation promise. This animation turns data rows into\n\t * DOM Table rows that are appended.\n\t */\n\tconst build = function(getFn, testFn, appendFn) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\t/*\n\t\t\t * Only draw a small number of rows to prevent the user interface\n\t\t\t * from hanging. If the total animation covers a large number of rows\n\t\t\t * it is spread across several animation frames.\n\t\t\t */\n\t\t\tconst anim = function(taskStartTime) {\n\t\t\t\tvar html = [];\n\t\t\t\t\n\t\t\t\t// spend settings.animationCalcTime for generating rows\n\t\t\t\twhile(testFn() && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {\n\t\t\t\t\thtml.push(getFn());\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t// append generated rows - this will require additional time \n\t\t\t\t// for rendering and painting (so keep animationCalcTime below\n\t\t\t\t// 16ms)\n\t\t\t\tif(html.length > 0) {\n\t\t\t\t\tappendFn(html);\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tif(testFn()) {\n\t\t\t\t\t// continue animation in next frame\n\t\t\t\t\twindow.requestAnimationFrame(anim);\n\t\t\t\t} else {\n\t\t\t\t\t// animation done\n\t\t\t\t\tresolve(html);\n\t\t\t\t}\n\t\t\t};\n\t\t\t\n\t\t\twindow.requestAnimationFrame(anim);\t\t\t\n\t\t});\n\t};\n\n\t\n\t/*\n\t * Free any rendered rows that are no longer needed. Only relevant\n\t * if settings.keepExisting = false\n\t */\n\tconst free = function() {\n\t\tconst currentWindow = calcCurrentWindow();\n\t\tconst targetWindow = calcTargetWindow();\n\t\t\n\t\tif(targetWindow.bottom < currentWindow.bottom) {\n\t\t\tnextIter.setCurrent(targetWindow.bottom);\n\t\t\tsettings.deleteFn(targetWindow.bottom - currentWindow.bottom); // index will be negative - so removed from the end of the list\n\t\t\ttable.css({'margin-bottom': (settings.data.length - targetWindow.bottom) * settings.trHeight});\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[jQuery.Lazytable] bot -' + (currentWindow.bottom - targetWindow.bottom) + ' rows');\t\t\t\t\t\n\t\t\t}\t\t\t\n\t\t}\n\t\tif(targetWindow.top > currentWindow.top) {\n\t\t\tprevIter.setCurrent(targetWindow.top);\n\t\t\tsettings.deleteFn(0, targetWindow.top - currentWindow.top);\n\t\t\ttable.css({'margin-top': targetWindow.top * settings.trHeight});\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[jQuery.Lazytable] top -' + (targetWindow.top - currentWindow.top) + ' rows');\t\t\t\t\t\n\t\t\t}\n\t\t}\n\t};\n\n\t\n\t/*\n\t * Get the desired window based on current scroll position.\n\t */\n\tconst calcTargetWindow = function() {\n\t\tconst scrollTop = that.scrollTop();\n\t\tconst w = {\n\t\t\ttop: Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0),\n\t\t\tbottom: Math.min(Math.ceil((scrollTop + that.innerHeight()) / settings.trHeight) + settings.prefetch, settings.data.length - 1)\n\t\t};\n\t\tw.center = Math.min(Math.floor((w.bottom + w.top) / 2), settings.data.length - 1);\n\t\t\n\t\treturn w;\n\t};\n\t\n\t\n\t/* \n\t * Get the currently drawn window.\n\t */\n\tconst calcCurrentWindow = function() {\n\t\tconst w = {\n\t\t\ttop: prevIter.getCurrent(),\n\t\t\tbottom: nextIter.getCurrent()\n\t\t};\n\t\tw.center = Math.min(Math.floor((w.bottom + w.top) / 2), settings.data.length - 1);\n\t\t\n\t\treturn w;\n\t};\n\t\n\t\n\t/*\n\t * Update the set of rendered rows based on the current scroll position.\n\t * This function should be called every time the scroll position changes.\n\t */\n\tconst update = function() {\n\t\tconst targetWindow = calcTargetWindow();\n\t\tconst currentWindow = calcCurrentWindow();\n\n\t\tvar animations = [];\n\t\t\n\t\tif(targetWindow.top > currentWindow.bottom || targetWindow.bottom < currentWindow.top) {\n\t\t\t// targetWindow does not intersect with currentWindow\n\t\t\t// -> restart at targetWindow's center\n\t\t\tif(!reset) {\n\t\t\t\treset = true;\n\t\t\t\tanimations.push(restart(targetWindow.center).then(() => reset = false).then(update));\t\t\t\t\n\t\t\t}\n\t\t} else {\n\t\t\tif(targetWindow.bottom >= currentWindow.bottom) {\n\t\t\t\t// more rows at the bottom of the table are needed\n\t\t\t\tanimations.push(build(\n\t\t\t\t\t\t() => nextIter.next(),\n\t\t\t\t\t\t() => !reset && nextIter.hasNext() && nextIter.getCurrent() <= targetWindow.bottom,\n\t\t\t\t\t\thtml => {\n\t\t\t\t\t\t\tsettings.appendFn(html);\n\t\t\t\t\t\t\ttable.css({'margin-bottom': (settings.data.length - nextIter.getCurrent()) * settings.trHeight});\n\t\t\t\t\t\t\tif(settings.debug) {\n\t\t\t\t\t\t\t\tconsole.log('[jQuery.Lazytable] bot +' + html.length + ' rows');\n\t\t\t\t\t\t\t}\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t})\n\t\t\t\t);\n\t\t\t}\n\t\t\tif(targetWindow.top < currentWindow.top) {\n\t\t\t\t// more rows at the top of the table are needed\n\t\t\t\tanimations.push(build(\n\t\t\t\t\t\t() => prevIter.prev(),\n\t\t\t\t\t\t() => !reset && prevIter.hasPrev() && prevIter.getCurrent() > targetWindow.top,\n\t\t\t\t\t\thtml => {\n\t\t\t\t\t\t\tsettings.prependFn(html.reverse());\n\t\t\t\t\t\t\ttable.css({'margin-top': prevIter.getCurrent() * settings.trHeight});\n\t\t\t\t\t\t\tif(settings.debug) {\n\t\t\t\t\t\t\t\tconsole.log('[jQuery.Lazytable] top +' + html.length + ' rows');\n\t\t\t\t\t\t\t}\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t})\n\t\t\t\t);\t\t\t\t\n\t\t\t}\n\t\t}\n\t\t\n\t\treturn Promise.all(animations).then(() => {\n\t\t\tif(!settings.keepExisting) {\n\t\t\t\tfree();\n\t\t\t}\n\t\t\tif(settings.debug) {\n\t\t\t\tconst n = nextIter.getCurrent() - prevIter.getCurrent();\n\t\t\t\tconst marginTopStr = table.css('margin-top');\n\t\t\t\tconst marginTop = parseInt(marginTopStr.substr(0, marginTopStr.length - 2));\n\t\t\t\tconst marginBotStr = table.css('margin-bottom');\n\t\t\t\tconst marginBot = parseInt(marginBotStr.substr(0, marginBotStr.length - 2));\n\t\t\t\tconsole.log('[jQuery.Lazytable] nVisible: ' + n);\n\t\t\t\tconsole.assert(((marginTop + marginBot) == (settings.data.length - n) * settings.trHeight), {\n\t\t\t\t\t\"message\": \"margin claculation wrong\",\n\t\t\t\t\t\"nTotal\": settings.data.length, \n\t\t\t\t\t\"nVisible\": n,\n\t\t\t\t\t\"top\": marginTop,\n\t\t\t\t\t\"bottom\": marginBot,\n\t\t\t\t\t\"trHeight\": settings.trHeight\n\t\t\t\t});\n\t\t\t}\n\t\t\tif(typeof(settings.onRedraw) === 'function') {\n\t\t\t\tsettings.onRedraw();\n\t\t\t}\t\t\t\n\t\t});\n\t};\n\t\n\t\n\t/* \n\t * Move a certain index to center of window, if possible. \n\t */\n\tconst center = function(index) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tconst top = Math.min(\n\t\t\t\t\tMath.max(index * settings.trHeight - (that.innerHeight() - settings.trHeight)/2, 0),\n\t\t\t\t\tthat.prop('scrollHeight')\n\t\t\t);\n\t\t\tthat.scrollTop(top);\n\t\t\twindow.setTimeout(resolve, 16);\t\t\t\n\t\t});\n\t};\n\t\n\t\n\t/*\n\t * Focus an index - move it to the visible part of the window.\n\t * If index is outside the current window, the table will be\n\t * rebuilt with index being centered.\n\t */\n\tconst focus = function(index) {\n\t\tconst currentWindow = calcCurrentWindow();\n\t\tfocusedIndex = index;\n\t\t\n\t\tif(currentWindow.top <= index && index < currentWindow.bottom) {\n\t\t\treturn new Promise((resolve, reject) => {\n\t\t\t\t/*\n\t\t\t\t * If the desired index is within the currently active area,\n\t\t\t\t * the table window will scroll until the desired index reaches\n\t\t\t\t * the window's visible area.\n\t\t\t\t */\n\t\t\t\tconst offset = index * settings.trHeight;\n\t\t\t\tconst windowTop = that.scrollTop();\n\t\t\t\tconst windowHeight = that.innerHeight();\n\n\t\t\t\t// Do not center index, as it is already within current viewport.\n\t\t\t\t// Only adjust position, if it is only partly visible.\n\t\t\t\tvar scrollTop = -1;\n\t\t\t\tif(offset + settings.trHeight > windowTop + windowHeight) {\n\t\t\t\t\tscrollTop = Math.max(0, offset - (windowHeight - settings.trHeight));\n\t\t\t\t} else if(offset < windowTop ) {\n\t\t\t\t\tscrollTop = offset;\n\t\t\t\t}\n\t\t\t\tif(scrollTop >= 0) {\n\t\t\t\t\tthat.scrollTop(scrollTop);\t\n\t\t\t\t}\n\t\t\t\twindow.setTimeout(resolve, 16);\t\t\t\t\n\t\t\t});\n\t\t}\n\n\t\t/*\n\t\t * Else: If desired index is not within currently active area,\n\t\t * the table will be rebuilt from scratch. \n\t\t */\n\t\treturn restart(index);\n\t};\n\t\n\t\n\t/*\n\t * Restart table drawing at a given index.\n\t * The index will be centered.\n\t */\n\tconst restart = function(index) {\n\t\treturn start(index, false).then(function() {\n\t\t\treturn center(index);\n\t\t}).then(update);\n\t};\n\t\n\t\n\t/*\n\t * Draw the first row in the table. settings.trHeight will be calculated \n\t * if desired and necessary.\n\t */\n\tconst start = function(index, calcTrHeight) {\n\t\treturn new Promise((resolve, reject) => {\n\t\t\tconst finalize = function() {\n\t\t\t\tconst paddingTop = index * settings.trHeight;\n\t\t\t\tconst height = settings.trHeight * settings.data.length;\n\t\t\t\tconst paddingBottom = height - paddingTop - settings.trHeight;\n\t\t\t\n\t\t\t\ttable.css({\n\t\t\t\t\t'margin-bottom': paddingBottom,\n\t\t\t\t\t'margin-top': paddingTop,\n\t\t\t\t});\n\t\t\t\t\n\t\t\t\tresolve();\n\t\t\t};\n\t\t\t\n\t\t\t// remove all table elements\n\t\t\tsettings.deleteFn(0);\n\t\t\t\n\t\t\t// start at element to be focused\n\t\t\tnextIter.setCurrent(index);\n\t\t\tprevIter.setCurrent(index);\n\t\t\t\n\t\t\t// insert new row\n\t\t\tif(nextIter.hasNext()) {\n\t\t\t\tsettings.appendFn([nextIter.next()]);\n\t\t\t\tif(calcTrHeight) {\n\t\t\t\t\t/*\n\t\t\t\t\t * Height calculation: After insterting the first row,\n\t\t\t\t\t * we wait for it to get drawn. When it is ready, we\n\t\t\t\t\t * use the first row's height to calculate margins.\n\t\t\t\t\t */\n\t\t\t\n\t\t\t\t\twaitForRow().then(function(row) {\n\t\t\t\t\t\tconst cs = window.getComputedStyle(row);\n\t\t\t\t\t\tconst cssHeight = cs.getPropertyValue('height');\n\t\t\t\t\t\tconst matches = cssHeight.match(/([\\.\\d]+)px/);\n\t\t\t\t\n\t\t\t\t\t\tif(matches) {\n\t\t\t\t\t\t\tsettings.trHeight = parseFloat(matches[1]);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tsettings.trHeight = row.offsetHeight;\n\t\t\t\t\t\t}\n\t\t\t\t\t}).then(finalize);\n\t\t\t\t} else {\n\t\t\t\t\tfinalize();\n\t\t\t\t}\n\t\t\t} else {\n\t\t\t\tfinalize();\n\t\t\t}\t\t\t\n\t\t});\n\t};\n\t\n\t\n\t/*\n\t * Restore table after table window div has been resized.\n\t */\n\tconst resize = function() {\n\t\treturn waitForRow().then(row => {\n\t\t\tconst cssHeight = window.getComputedStyle(row).getPropertyValue('height');\n\t\t\tvar matches;\n\t\t\tconst height = (matches = cssHeight.match(/([\\.\\d]+)px/)) ? parseFloat(matches[1]) : row.offsetHeight;\n\t\t\t\n\t\t\tif((height > 0) && (height != settings.trHeight)) {\n\t\t\t\t// height has changed\n\t\t\t\tsettings.trHeight = height;\n\t\t\t\t\n\t\t\t\tconst startIndex = focusedIndex ? focusedIndex : Math.min(Math.floor((prevIter.getCurrent() + nextIter.getCurrent()) / 2), settings.data.length -1);\n\t\t\t\t\n\t\t\t\treturn restart(startIndex);\n\t\t\t}\n\t\t\t\n\t\t\tif(focusedIndex) {\n\t\t\t\t// height has not changed, but focuse row \n\t\t\t\t// might have gone out of visible area\n\t\t\t\treturn focus(focusedIndex);\n\t\t\t}\t\t\t\n\t\t});\n\t};\n\t\n\t\n\t/*\n\t * Start all up.\n\t */\n\tconst init = function() {\n\t\t// remove old event handlers\n\t\tthat.off('scroll');\n\t\tthat.off('lazytable:focus');\n\t\tthat.off('lazytable:resize');\n\t\t\n\t\t// Temporarily setting the overflow property to 'hidden'\n\t\t// during initialisation fixes a bug related to scrollTop \n\t\t// being unchangeable.\n\t\t// See: https://code.google.com/p/android/issues/detail?id=19625#c25\n\t\tthat.css({'overflow-y': 'hidden'});\n\n\t\tstart(settings.startIndex, true).then(function() {\n\t\t\tfocusedIndex = settings.startIndex;\n\t\t\treturn center(settings.startIndex);\n\t\t}).then(update).then(function() {\n\t\t\t// reset overflow to 'scroll'\n\t\t\tthat.css({'overflow-y': 'scroll'});\n\n\t\t\tif(typeof(settings.onInit) == 'function') {\n\t\t\t\tsettings.onInit();\n\t\t\t}\n\n\t\t\t// add event handlers\n\t\t\tthat.on('scroll', function() {\n\t\t\t\tupdate();\n\t\t\t});\n\t\t\tthat.on('lazytable:focus', function(event, index, callback) {\n\t\t\t\tfocus(index).then(function() {\n\t\t\t\t\tif(typeof(callback) === 'function') {\n\t\t\t\t\t\tcallback();\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t});\n\t\t\tthat.on('lazytable:resize', function() {\n\t\t\t\tif(!resizeAnimationWorking) {\n\t\t\t\t\tresizeAnimationWorking = true;\n\t\t\t\t\tresize().then(update).finally(function() {\n\t\t\t\t\t\tresizeAnimationWorking = false;\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t});\n\t};\n\tinit();\n\t\n\treturn this;\n}\n\n//# sourceURL=webpack:///./src/lib/lazyTable.js?");

/***/ }),

/***/ "./src/lib/tableRowIterator.js":
/*!*************************************!*\
  !*** ./src/lib/tableRowIterator.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return TableRowIterator; });\n/**\n * This object will act as a seekable iterator over a dataset.\n * It uses a generatorFunction that processes each row before it\n * is delivered to the caller.\n */\nfunction TableRowIterator(generatorFunction, rows) {\n\tthis.generatorFunction = generatorFunction;\n\tthis.rows = rows;\n\tthis.current = 0;\n}\nTableRowIterator.prototype.clone = function() {\n\tvar newIt = new TableRowIterator(this.generatorFunction);\n\tnewIt.rows = this.rows;\n\tnewIt.current = this.current;\n\treturn newIt;\n};\nTableRowIterator.prototype.getCurrent = function() {\n\treturn this.current;\n};\n\nTableRowIterator.prototype.setCurrent = function(index) {\n\tif(index >= 0 && index < this.rows.length) {\n\t\tthis.current = index;\n\t}\n};\n\nTableRowIterator.prototype.next = function() {\n\treturn this.generatorFunction(this.rows[this.current++]);\n};\n\nTableRowIterator.prototype.hasNext = function() {\n\treturn this.current < this.rows.length;\n};\n\nTableRowIterator.prototype.prev = function() {\n\treturn this.generatorFunction(this.rows[--this.current]);\n};\n\nTableRowIterator.prototype.hasPrev = function() {\n\treturn this.current > 0;\n};\n\t\n\n\n//# sourceURL=webpack:///./src/lib/tableRowIterator.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _polyfills_requestAnimationFrame_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfills/requestAnimationFrame.js */ \"./src/polyfills/requestAnimationFrame.js\");\n/* harmony import */ var _polyfills_requestAnimationFrame_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_polyfills_requestAnimationFrame_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _polyfills_performance_now_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polyfills/performance.now.js */ \"./src/polyfills/performance.now.js\");\n/* harmony import */ var _polyfills_performance_now_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_polyfills_performance_now_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_lazyTable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/lazyTable.js */ \"./src/lib/lazyTable.js\");\n\n\n\n\n(function($) {\n\t$.fn.LazyTable = _lib_lazyTable_js__WEBPACK_IMPORTED_MODULE_2__[\"default\"];\n}(jQuery));\n\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ }),

/***/ "./src/polyfills/performance.now.js":
/*!******************************************!*\
  !*** ./src/polyfills/performance.now.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// window.performance.now polyfill -- available at: https://gist.github.com/paulirish/5438650\n\n// @license http://opensource.org/licenses/MIT\n// copyright Paul Irish 2015\n\n\n// Date.now() is supported everywhere except IE8. For IE8 we use the Date.now polyfill\n//   github.com/Financial-Times/polyfill-service/blob/master/polyfills/Date.now/polyfill.js\n// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values\n\n// if you want values similar to what you'd get with real perf.now, place this towards the head of the page\n// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed\n\n(function(global){\n  if (\"performance\" in window == false) {\n      window.performance = {};\n  }\n  \n  Date.now = (Date.now || function () {  // thanks IE8\n\t  return new Date().getTime();\n  });\n\n  if (\"now\" in window.performance == false){\n    var nowOffset = Date.now();\n    \n    if (performance.timing && performance.timing.navigationStart){\n      nowOffset = performance.timing.navigationStart\n    }\n\n    window.performance.now = function now(){\n      return Date.now() - nowOffset;\n    }\n  }\n})();\n\n//# sourceURL=webpack:///./src/polyfills/performance.now.js?");

/***/ }),

/***/ "./src/polyfills/requestAnimationFrame.js":
/*!************************************************!*\
  !*** ./src/polyfills/requestAnimationFrame.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// requestAnimationFrame polyfill -- available at: https://gist.github.com/paulirish/1579671\n// copyright Paul Irish\n\n// http://paulirish.com/2011/requestanimationframe-for-smart-animating/\n// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating\n\n// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel\n\n// MIT license\n\n(function(global) {\n    var lastTime = 0;\n    var vendors = ['ms', 'moz', 'webkit', 'o'];\n    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {\n        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];\n        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] \n                                   || window[vendors[x]+'CancelRequestAnimationFrame'];\n    }\n \n    if (!window.requestAnimationFrame)\n        window.requestAnimationFrame = function(callback, element) {\n            var currTime = new Date().getTime();\n            var timeToCall = Math.max(0, 16 - (currTime - lastTime));\n            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, \n              timeToCall);\n            lastTime = currTime + timeToCall;\n            return id;\n        };\n \n    if (!window.cancelAnimationFrame)\n        window.cancelAnimationFrame = function(id) {\n            clearTimeout(id);\n        };\n})();\n\n\n//# sourceURL=webpack:///./src/polyfills/requestAnimationFrame.js?");

/***/ })

/******/ });
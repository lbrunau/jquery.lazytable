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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return LazyTable; });\n/* harmony import */ var _tableRowIterator_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tableRowIterator.js */ \"./src/lib/tableRowIterator.js\");\n\n\nfunction LazyTable(options) {\n\tconst that = this;\n\tconst table = this.find('table');\n\tconst tableBody = this.find('table tbody');\n\n\tconst defaults = {\n\t\t\tdebug: false,         // output console logs\n\t\t\ttrHeight: 0,          // height of a single row - set to 0 for automatic determination\n\t\t\tdata: [],             // raw data\n\t\t\tgenerator: function(row) { return '<tr><td>' + row.join('</td><td>') + '</td></tr>'; }, // function to turn array into html code for table row\n\t\t\tstartIndex: 0,        // initially centered element\n\t\t\tkeepExisting: true,   // if true, rows will not be deleted when getting out of visible area \n\t\t\tprefetch: 0,          // number of rows by which to extend visible area\n\t\t\tanimationCalcTime: 3, // milliseconds\n\t\t\tappendFn: function(rows) { \n\t\t\t\ttableBody.append(rows.join()); \n\t\t\t\treturn $.Deferred().resolve().promise(); \n\t\t\t},\n\t\t\tprependFn: function(rows) { \n\t\t\t\ttableBody.prepend(rows.join()); \n\t\t\t\treturn $.Deferred().resolve().promise(); \n\t\t\t},\n\t\t\tdeleteFn: function(startIndex, endIndex) { \n\t\t\t\ttableBody.children().slice(startIndex, endIndex).remove();\n\t\t\t\treturn $.Deferred().resolve().promise();\n\t\t\t},\n\t\t\tonInit: null,         // callback function - will be called after initialization has finished\n\t\t\tonRedraw: null        // callback function - will be called after rows have been added or removed\n\t};\n\tconst settings = $.extend({}, defaults, options);\n\t\n\tvar nextIter = new _tableRowIterator_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"](settings.generator, settings.data);\n\tnextIter.setCurrent(settings.startIndex);\n\tvar prevIter = nextIter.clone();\n\tvar workingUp = settings.startIndex;\n\tvar workingDown = settings.startIndex;\n\tvar upAnimationWorking = false;\n\tvar downAnimationWorking = false;\n\tvar resizeAnimationWorking = false;\n\tvar focusedIndex = false;\n\n\tconst waitForRow = function() {\n\t\tvar tries = 1;\n\t\tconst rowDeferred = $.Deferred();\n\t\tconst wait = function() {\n\t\t\tconst rows = tableBody.children();\n\t\t\tif(rows.length > 0) {\n\t\t\t\t// wait one frame before resolving\n\t\t\t\twindow.setTimeout(function() { rowDeferred.resolve(rows.get(0)); }, 16);\n\t\t\t} else if(tries++ < 10){\n\t\t\t\t// retry\n\t\t\t\twindow.setTimeout(wait, 100);\n\t\t\t} else {\n\t\t\t\trowDeferred.reject();\n\t\t\t}\n\t\t};\n\t\twait();\n\t\treturn rowDeferred.promise();\n\t};\n\n\t\n\tconst buildDown = function() {\n\t\tconst deferred = $.Deferred();\n\t\tconst anim = function(taskStartTime) {\n\n\t\t\tvar html = [];\n\t\t\tvar n = 0;\n\n\t\t\twhile(nextIter.hasNext() && (nextIter.getCurrent() <= workingDown) && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {\n\t\t\t\thtml.push(nextIter.next());\n\t\t\t\tn++;\n\t\t\t}\n\t\t\tif(html.length > 0) {\n\t\t\t\tsettings.appendFn(html);\n\t\t\t\ttable.css({'margin-bottom': (settings.data.length - nextIter.getCurrent()) * settings.trHeight});\n\t\t\t}\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[TableWindow] bot +' + n + ' rows');\t\t\t\t\t\n\t\t\t}\n\t\t\tif(nextIter.getCurrent() <= workingDown) {\n\t\t\t\twindow.requestAnimationFrame(anim);\n\t\t\t} else {\n\t\t\t\tdeferred.resolve();\n\t\t\t}\n\t\t};\n\t\twindow.requestAnimationFrame(anim);\n\t\treturn deferred.promise();\n\t};\n\t\n\tconst buildUp = function() {\n\t\tconst deferred = $.Deferred();\n\t\tconst anim = function(taskStartTime) {\n\t\t\tvar html = [];\n\t\t\tvar n = 0;\n\t\t\twhile(prevIter.hasPrev() && (prevIter.getCurrent() > workingUp) && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {\n\t\t\t\thtml.unshift(prevIter.prev());\n\t\t\t\tn++;\n\t\t\t}\n\t\t\tif(html.length > 0) {\n\t\t\t\tsettings.prependFn(html);\n\t\t\t\ttable.css({'margin-top': prevIter.getCurrent() * settings.trHeight});\n\t\t\t}\n\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[TableWindow] top +' + n + ' rows');\t\t\t\t\t\n\t\t\t}\n\t\t\tif(prevIter.getCurrent() > workingUp) {\n\t\t\t\twindow.requestAnimationFrame(anim);\n\t\t\t} else {\n\t\t\t\tdeferred.resolve();\n\t\t\t}\n\t\t};\n\t\twindow.requestAnimationFrame(anim);\n\t\treturn deferred.promise();\n\t};\n\t\n\tconst free = function() {\n\t\tconst scrollTop = that.scrollTop();\n\t\tconst start = prevIter.getCurrent();\n\t\tconst end = nextIter.getCurrent();\n\t\t\n\t\tconst cleaningUp = Math.min(Math.ceil((scrollTop + that.innerHeight())/ settings.trHeight) + settings.prefetch, settings.data.length);\n\t\tconst cleaningDown = Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0);\n\t\t\t\t\n\t\tif(!downAnimationWorking && cleaningUp < end) {\n\t\t\tnextIter.setCurrent(cleaningUp);\n\t\t\tsettings.deleteFn(cleaningUp - end); // index will be negative - so removed from the end of the list\n\t\t\ttable.css({'margin-bottom': (settings.data.length - cleaningUp) * settings.trHeight});\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[TableWindow] bot -' + (end - cleaningUp) + ' rows');\t\t\t\t\t\n\t\t\t}\n\t\t}\n\t\tif(!upAnimationWorking && cleaningDown > start) {\n\t\t\tprevIter.setCurrent(cleaningDown);\n\t\t\tsettings.deleteFn(0, cleaningDown - start);\n\t\t\ttable.css({'margin-top': cleaningDown * settings.trHeight});\n\t\t\tif(settings.debug) {\n\t\t\t\tconsole.log('[TableWindow] top -' + (cleaningDown - start) + ' rows');\t\t\t\t\t\n\t\t\t}\n\t\t}\n\t};\n\t\n\tconst update = function() {\n\t\tconst updateDeferred = $.Deferred();\n\t\t\n\t\tconst finalizeRedraw = function() {\n\t\t\tif(!settings.keepExisting) {\n\t\t\t\tfree();\n\t\t\t}\n\t\t\tif(settings.debug) {\n\t\t\t\tconst n = nextIter.getCurrent() - prevIter.getCurrent();\n\t\t\t\tconst marginTopStr = table.css('margin-top');\n\t\t\t\tconst marginTop = parseInt(marginTopStr.substr(0, marginTopStr.length - 2));\n\t\t\t\tconst marginBotStr = table.css('margin-bottom');\n\t\t\t\tconst marginBot = parseInt(marginBotStr.substr(0, marginBotStr.length - 2));\n\t\t\t\tconsole.log('[TableWindow] nVisible: ' + n);\n\t\t\t\tconsole.assert(((marginTop + marginBot) == (settings.data.length - n) * settings.trHeight), {\n\t\t\t\t\t\"message\": \"margin claculation wrong\",\n\t\t\t\t\t\"nTotal\": settings.data.length, \n\t\t\t\t\t\"nVisible\": n,\n\t\t\t\t\t\"top\": marginTop,\n\t\t\t\t\t\"bottom\": marginBot,\n\t\t\t\t\t\"trHeight\": settings.trHeight\n\t\t\t\t});\n\t\t\t}\n\t\t\tif(typeof(settings.onRedraw) === 'function') {\n\t\t\t\tsettings.onRedraw();\n\t\t\t}\n\t\t};\n\n\t\tconst scrollTop = that.scrollTop();\n\t\t\n\t\tworkingDown = Math.min(Math.ceil((scrollTop + that.innerHeight()) / settings.trHeight) + settings.prefetch, settings.data.length - 1);\n\t\tworkingUp = Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0);\n\t\t\n\t\tvar animations = [];\n\t\t\n\t\t// only start animation if it is not currently active\n\t\tif(!downAnimationWorking && workingDown >= nextIter.getCurrent()) {\n\t\t\tvar downDeferred = $.Deferred();\n\t\t\tdownAnimationWorking = true;\n\t\t\tbuildDown().done(function() {\n\t\t\t\tfinalizeRedraw();\n\t\t\t\tdownAnimationWorking = false;\n\t\t\t\tdownDeferred.resolve();\n\t\t\t});\n\t\t\tanimations.push(downDeferred);\n\t\t}\n\t\t\n\t\tif(!upAnimationWorking && workingUp < prevIter.getCurrent()) {\n\t\t\tvar upDeferred = $.Deferred();\n\t\t\tupAnimationWorking = true;\n\t\t\tbuildUp().done(function() {\n\t\t\t\tfinalizeRedraw();\n\t\t\t\tupAnimationWorking = false;\n\t\t\t\tupDeferred.resolve();\n\t\t\t});\n\t\t\tanimations.push(upDeferred);\n\t\t} \n\t\t\n\t\t$.when(animations).done(function() {\n\t\t\t// wait for both animations\n\t\t\tupdateDeferred.resolve();\n\t\t});\n\t\t\n\t\treturn updateDeferred.promise();\n\t};\n\t\n\t/* Move index to center of window, if possible. */\n\tconst center = function(index) {\n\t\tconst centerDeferred = $.Deferred();\n\t\t\n\t\tconst top = Math.min(\n\t\t\t\tMath.max(index * settings.trHeight - (that.innerHeight() - settings.trHeight)/2, 0),\n\t\t\t\tthat.prop('scrollHeight')\n\t\t);\n\t\tthat.scrollTop(top);\n\t\twindow.setTimeout(function() { centerDeferred.resolve(); }, 16);\n\t\t\n\t\treturn centerDeferred.promise();\n\t};\n\t\n\tconst focus = function(index) {\n\t\tconst focusDeferred = $.Deferred();\n\t\t\n\t\tconst startIndex = prevIter.getCurrent();\n\t\tconst endIndex = nextIter.getCurrent();\n\t\t\n\t\tif(startIndex <= index && index < endIndex) {\n\t\t\t/*\n\t\t\t * If the desired index is within the currently active area,\n\t\t\t * the table window will scroll until the desired index reaches\n\t\t\t * the window's visible area.\n\t\t\t */\n\t\t\tconst offset = index * settings.trHeight;\n\t\t\tconst windowTop = that.scrollTop();\n\t\t\tconst windowHeight = that.innerHeight();\n\n\t\t\t// Do not center index, as it is already within current viewport.\n\t\t\t// Only adjust position, if it is only partly visible.\n\t\t\tvar scrollTop = -1;\n\t\t\tif(offset + settings.trHeight > windowTop + windowHeight) {\n\t\t\t\tscrollTop = Math.max(0, offset - (windowHeight - settings.trHeight));\n\t\t\t} else if(offset < windowTop ) {\n\t\t\t\tscrollTop = offset;\n\t\t\t}\n\t\t\tif(scrollTop >= 0) {\n\t\t\t\tthat.scrollTop(scrollTop);\t\n\t\t\t}\n\t\t\twindow.setTimeout(function() { focusDeferred.resolve(); }, 16);\n\t\t} else {\n\t\t\t/*\n\t\t\t * If desired index is not within currently active area,\n\t\t\t * the table will be rebuilt from scratch. \n\t\t\t */\n\t\t\tstart(index, false).then(function() {\n\t\t\t\treturn center(index);\n\t\t\t}).then(update).always(function() {\n\t\t\t\tfocusDeferred.resolve();\n\t\t\t});\n\t\t}\n\t\t\n\t\tfocusedIndex = index;\n\t\treturn focusDeferred.promise();\n\t};\n\t\n\tconst start = function(index, calcTrHeight) {\n\t\tconst startDeferred = $.Deferred();\n\t\t\n\t\tconst finalize = function() {\n\t\t\tconst paddingTop = index * settings.trHeight;\n\t\t\tconst height = settings.trHeight * settings.data.length;\n\t\t\tconst paddingBottom = height - paddingTop - settings.trHeight;\n\t\t\n\t\t\ttable.css({\n\t\t\t\t'margin-bottom': paddingBottom,\n\t\t\t\t'margin-top': paddingTop,\n\t\t\t});\n\t\t\t\n\t\t\tstartDeferred.resolve();\n\t\t};\n\t\t\n\t\t// remove all table elements\n\t\tsettings.deleteFn(0);\n\t\t\n\t\t// start at element to be focused\n\t\tnextIter.setCurrent(index);\n\t\tprevIter.setCurrent(index);\n\t\t\n\t\t// insert new row\n\t\tif(nextIter.hasNext()) {\n\t\t\tsettings.appendFn([nextIter.next()]).then(function() {\n\t\t\t\tif(calcTrHeight) {\n\t\t\t\t\t/*\n\t\t\t\t\t * Height calculation: After insterting the first row,\n\t\t\t\t\t * we wait for it to get drawn. When it is ready, we\n\t\t\t\t\t * use the first row's height to calculate margins.\n\t\t\t\t\t */\n\t\t\t\n\t\t\t\t\twaitForRow().done(function(row) {\n\t\t\t\t\t\tconst cs = window.getComputedStyle(row);\n\t\t\t\t\t\tconst cssHeight = cs.getPropertyValue('height');\n\t\t\t\t\t\tconst matches = cssHeight.match(/([\\.\\d]+)px/);\n\t\t\t\t\n\t\t\t\t\t\tif(matches) {\n\t\t\t\t\t\t\tsettings.trHeight = parseFloat(matches[1]);\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tsettings.trHeight = row.offsetHeight;\n\t\t\t\t\t\t}\n\t\t\t\t\t}).always(finalize);\n\t\t\t\t} else {\n\t\t\t\t\tfinalize();\n\t\t\t\t}\n\t\t\t});\n\t\t} else {\n\t\t\tfinalize();\n\t\t}\n\n\t\treturn startDeferred.promise();\n\t};\n\t\n\tconst resize = function() {\n\t\tconst resizeDeferred = $.Deferred();\n\t\t\n\t\twaitForRow().done(function(row) {\n\t\t\tconst cssHeight = window.getComputedStyle(row).getPropertyValue('height');\n\t\t\tvar matches;\n\t\t\tconst height = (matches = cssHeight.match(/([\\.\\d]+)px/)) ? parseFloat(matches[1]) : row.offsetHeight;\n\t\t\t\n\t\t\tif((height > 0) && (height != settings.trHeight)) {\n\t\t\t\t// height has changed\n\t\t\t\tsettings.trHeight = height;\n\t\t\t\t\n\t\t\t\tconst startIndex = focusedIndex ? focusedIndex : Math.min(Math.floor((prevIter.getCurrent() + nextIter.getCurrent()) / 2), settings.data.length -1);\n\t\t\t\t\n\t\t\t\tstart(startIndex, false).then(function() {\n\t\t\t\t\treturn center(startIndex);\n\t\t\t\t}).always(function() {\n\t\t\t\t\tresizeDeferred.resolve();\n\t\t\t\t});\n\t\t\t} else if(focusedIndex) {\n\t\t\t\t// height has not changed, but focuse row \n\t\t\t\t// might have gone out of visible area\n\t\t\t\tfocus(focusedIndex).always(function() { resizeDeferred.resolve(); });\n\t\t\t} else {\n\t\t\t\t// nothing to do\n\t\t\t\tresizeDeferred.resolve();\n\t\t\t}\n\t\t}).fail(function() {\n\t\t\t// no rows in table\n\t\t\tresizeDeferred.reject();\n\t\t});\n\t\t\n\t\treturn resizeDeferred.promise();\n\t};\n\t\n\tconst init = function() {\n\t\t// remove old event handlers\n\t\tthat.off('scroll');\n\t\tthat.off('tableWindow:focus');\n\t\tthat.off('tableWindow:resize');\n\t\t\n\t\t// Temporarily setting the overflow property to 'hidden'\n\t\t// during initialisation fixes a bug related to scrollTop \n\t\t// being unchangeable.\n\t\t// See: https://code.google.com/p/android/issues/detail?id=19625#c25\n\t\tthat.css({'overflow-y': 'hidden'});\n\n\t\tstart(settings.startIndex, true).then(function() {\n\t\t\tfocusedIndex = settings.startIndex;\n\t\t\treturn center(settings.startIndex);\n\t\t}).then(update).always(function() {\n\t\t\t// reset overflow to 'scroll'\n\t\t\tthat.css({'overflow-y': 'scroll'});\n\n\t\t\tif(typeof(settings.onInit) == 'function') {\n\t\t\t\tsettings.onInit();\n\t\t\t}\n\n\t\t\t// add event handlers\n\t\t\tthat.on('scroll', function() {\n\t\t\t\tupdate();\n\t\t\t});\n\t\t\t//(that[0]).addEventListener('scroll', update, {passive: true});\n\t\t\t//(that[0]).addEventListener('touchmove', update, {passive: true});\n\t\t\tthat.on('tableWindow:focus', function(event, index, callback) {\n\t\t\t\tfocus(index).done(function() {\n\t\t\t\t\tif(typeof(callback) === 'function') {\n\t\t\t\t\t\tcallback();\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t});\n\t\t\tthat.on('tableWindow:resize', function() {\n\t\t\t\tif(!resizeAnimationWorking) {\n\t\t\t\t\tresizeAnimationWorking = true;\n\t\t\t\t\tresize().then(update).always(function() {\n\t\t\t\t\t\tresizeAnimationWorking = false;\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t});\n\t};\n\tinit();\n\t\n\treturn this;\n}\n\n//# sourceURL=webpack:///./src/lib/lazyTable.js?");

/***/ }),

/***/ "./src/lib/tableRowIterator.js":
/*!*************************************!*\
  !*** ./src/lib/tableRowIterator.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return TableRowIterator; });\nfunction TableRowIterator(generatorFunction, rows) {\n\tthis.generatorFunction = generatorFunction;\n\tthis.rows = rows;\n\tthis.current = 0;\n}\n(function() {\n\tundefined.clone = function() {\n\t\tvar newIt = new TableRowIterator(this.generatorFunction);\n\t\tnewIt.rows = this.rows;\n\t\tnewIt.current = this.current;\n\t\treturn newIt;\n\t};\n\t\n\tundefined.getCurrent = function() {\n\t\treturn this.current;\n\t};\n\t\n\tundefined.setCurrent = function(index) {\n\t\tif(index >= 0 && index < this.rows.length) {\n\t\t\tthis.current = index;\n\t\t}\n\t};\n\t\n\tundefined.next = function() {\n\t\treturn this.generatorFunction(this.rows[this.current++]);\n\t};\n\t\n\tundefined.hasNext = function() {\n\t\treturn this.current < this.rows.length;\n\t};\n\t\n\tundefined.prev = function() {\n\t\treturn this.generatorFunction(this.rows[--this.current]);\n\t};\n\t\n\tundefined.hasPrev = function() {\n\t\treturn this.current > 0;\n\t};\n}).call(TableRowIterator.prototype);\n\n//# sourceURL=webpack:///./src/lib/tableRowIterator.js?");

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
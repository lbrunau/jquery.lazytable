import "./polyfills/requestAnimationFrame.js";
import "./polyfills/performance.now.js";
import LazyTable from "./lib/lazyTable.js";

(function($) {
	$.fn.LazyTable = LazyTable;
}(jQuery));

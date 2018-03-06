import TableRowIterator from "./tableRowIterator.js";

export default function LazyTable(options) {
	const that = this;
	const table = this.find('table');
	const tableBody = this.find('table tbody');

	const defaults = {
			debug: false,         // output console logs
			trHeight: 0,          // height of a single row - set to 0 for automatic determination
			data: [],             // raw data
			generator: function(row) { return '<tr><td>' + row.join('</td><td>') + '</td></tr>'; }, // function to turn array into html code for table row
			startIndex: 0,        // initially centered element
			keepExisting: true,   // if true, rows will not be deleted when getting out of visible area 
			prefetch: 0,          // number of rows by which to extend visible area
			animationCalcTime: 3, // milliseconds
			appendFn: function(rows) { 
				tableBody.append(rows.join()); 
				return $.Deferred().resolve().promise(); 
			},
			prependFn: function(rows) { 
				tableBody.prepend(rows.join()); 
				return $.Deferred().resolve().promise(); 
			},
			deleteFn: function(startIndex, endIndex) { 
				tableBody.children().slice(startIndex, endIndex).remove();
				return $.Deferred().resolve().promise();
			},
			onInit: null,         // callback function - will be called after initialization has finished
			onRedraw: null        // callback function - will be called after rows have been added or removed
	};
	const settings = $.extend({}, defaults, options);
	
	var nextIter = new TableRowIterator(settings.generator, settings.data);
	nextIter.setCurrent(settings.startIndex);
	var prevIter = nextIter.clone();
	var workingUp = settings.startIndex;
	var workingDown = settings.startIndex;
	var upAnimationWorking = false;
	var downAnimationWorking = false;
	var resizeAnimationWorking = false;
	var focusedIndex = false;

	const waitForRow = function() {
		var tries = 1;
		const rowDeferred = $.Deferred();
		const wait = function() {
			const rows = tableBody.children();
			if(rows.length > 0) {
				// wait one frame before resolving
				window.setTimeout(function() { rowDeferred.resolve(rows.get(0)); }, 16);
			} else if(tries++ < 10){
				// retry
				window.setTimeout(wait, 100);
			} else {
				rowDeferred.reject();
			}
		};
		wait();
		return rowDeferred.promise();
	};

	
	const buildDown = function() {
		const deferred = $.Deferred();
		const anim = function(taskStartTime) {

			var html = [];
			var n = 0;

			while(nextIter.hasNext() && (nextIter.getCurrent() <= workingDown) && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {
				html.push(nextIter.next());
				n++;
			}
			if(html.length > 0) {
				settings.appendFn(html);
				table.css({'margin-bottom': (settings.data.length - nextIter.getCurrent()) * settings.trHeight});
			}
			if(settings.debug) {
				console.log('[TableWindow] bot +' + n + ' rows');					
			}
			if(nextIter.getCurrent() <= workingDown) {
				window.requestAnimationFrame(anim);
			} else {
				deferred.resolve();
			}
		};
		window.requestAnimationFrame(anim);
		return deferred.promise();
	};
	
	const buildUp = function() {
		const deferred = $.Deferred();
		const anim = function(taskStartTime) {
			var html = [];
			var n = 0;
			while(prevIter.hasPrev() && (prevIter.getCurrent() > workingUp) && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {
				html.unshift(prevIter.prev());
				n++;
			}
			if(html.length > 0) {
				settings.prependFn(html);
				table.css({'margin-top': prevIter.getCurrent() * settings.trHeight});
			}

			if(settings.debug) {
				console.log('[TableWindow] top +' + n + ' rows');					
			}
			if(prevIter.getCurrent() > workingUp) {
				window.requestAnimationFrame(anim);
			} else {
				deferred.resolve();
			}
		};
		window.requestAnimationFrame(anim);
		return deferred.promise();
	};
	
	const free = function() {
		const scrollTop = that.scrollTop();
		const start = prevIter.getCurrent();
		const end = nextIter.getCurrent();
		
		const cleaningUp = Math.min(Math.ceil((scrollTop + that.innerHeight())/ settings.trHeight) + settings.prefetch, settings.data.length);
		const cleaningDown = Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0);
				
		if(!downAnimationWorking && cleaningUp < end) {
			nextIter.setCurrent(cleaningUp);
			settings.deleteFn(cleaningUp - end); // index will be negative - so removed from the end of the list
			table.css({'margin-bottom': (settings.data.length - cleaningUp) * settings.trHeight});
			if(settings.debug) {
				console.log('[TableWindow] bot -' + (end - cleaningUp) + ' rows');					
			}
		}
		if(!upAnimationWorking && cleaningDown > start) {
			prevIter.setCurrent(cleaningDown);
			settings.deleteFn(0, cleaningDown - start);
			table.css({'margin-top': cleaningDown * settings.trHeight});
			if(settings.debug) {
				console.log('[TableWindow] top -' + (cleaningDown - start) + ' rows');					
			}
		}
	};
	
	const update = function() {
		const updateDeferred = $.Deferred();
		
		const finalizeRedraw = function() {
			if(!settings.keepExisting) {
				free();
			}
			if(settings.debug) {
				const n = nextIter.getCurrent() - prevIter.getCurrent();
				const marginTopStr = table.css('margin-top');
				const marginTop = parseInt(marginTopStr.substr(0, marginTopStr.length - 2));
				const marginBotStr = table.css('margin-bottom');
				const marginBot = parseInt(marginBotStr.substr(0, marginBotStr.length - 2));
				console.log('[TableWindow] nVisible: ' + n);
				console.assert(((marginTop + marginBot) == (settings.data.length - n) * settings.trHeight), {
					"message": "margin claculation wrong",
					"nTotal": settings.data.length, 
					"nVisible": n,
					"top": marginTop,
					"bottom": marginBot,
					"trHeight": settings.trHeight
				});
			}
			if(typeof(settings.onRedraw) === 'function') {
				settings.onRedraw();
			}
		};

		const scrollTop = that.scrollTop();
		
		workingDown = Math.min(Math.ceil((scrollTop + that.innerHeight()) / settings.trHeight) + settings.prefetch, settings.data.length - 1);
		workingUp = Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0);
		
		var animations = [];
		
		// only start animation if it is not currently active
		if(!downAnimationWorking && workingDown >= nextIter.getCurrent()) {
			var downDeferred = $.Deferred();
			downAnimationWorking = true;
			buildDown().done(function() {
				finalizeRedraw();
				downAnimationWorking = false;
				downDeferred.resolve();
			});
			animations.push(downDeferred);
		}
		
		if(!upAnimationWorking && workingUp < prevIter.getCurrent()) {
			var upDeferred = $.Deferred();
			upAnimationWorking = true;
			buildUp().done(function() {
				finalizeRedraw();
				upAnimationWorking = false;
				upDeferred.resolve();
			});
			animations.push(upDeferred);
		} 
		
		$.when(animations).done(function() {
			// wait for both animations
			updateDeferred.resolve();
		});
		
		return updateDeferred.promise();
	};
	
	/* Move index to center of window, if possible. */
	const center = function(index) {
		const centerDeferred = $.Deferred();
		
		const top = Math.min(
				Math.max(index * settings.trHeight - (that.innerHeight() - settings.trHeight)/2, 0),
				that.prop('scrollHeight')
		);
		that.scrollTop(top);
		window.setTimeout(function() { centerDeferred.resolve(); }, 16);
		
		return centerDeferred.promise();
	};
	
	const focus = function(index) {
		const focusDeferred = $.Deferred();
		
		const startIndex = prevIter.getCurrent();
		const endIndex = nextIter.getCurrent();
		
		if(startIndex <= index && index < endIndex) {
			/*
			 * If the desired index is within the currently active area,
			 * the table window will scroll until the desired index reaches
			 * the window's visible area.
			 */
			const offset = index * settings.trHeight;
			const windowTop = that.scrollTop();
			const windowHeight = that.innerHeight();

			// Do not center index, as it is already within current viewport.
			// Only adjust position, if it is only partly visible.
			var scrollTop = -1;
			if(offset + settings.trHeight > windowTop + windowHeight) {
				scrollTop = Math.max(0, offset - (windowHeight - settings.trHeight));
			} else if(offset < windowTop ) {
				scrollTop = offset;
			}
			if(scrollTop >= 0) {
				that.scrollTop(scrollTop);	
			}
			window.setTimeout(function() { focusDeferred.resolve(); }, 16);
		} else {
			/*
			 * If desired index is not within currently active area,
			 * the table will be rebuilt from scratch. 
			 */
			start(index, false).then(function() {
				return center(index);
			}).then(update).always(function() {
				focusDeferred.resolve();
			});
		}
		
		focusedIndex = index;
		return focusDeferred.promise();
	};
	
	const start = function(index, calcTrHeight) {
		const startDeferred = $.Deferred();
		
		const finalize = function() {
			const paddingTop = index * settings.trHeight;
			const height = settings.trHeight * settings.data.length;
			const paddingBottom = height - paddingTop - settings.trHeight;
		
			table.css({
				'margin-bottom': paddingBottom,
				'margin-top': paddingTop,
			});
			
			startDeferred.resolve();
		};
		
		// remove all table elements
		settings.deleteFn(0);
		
		// start at element to be focused
		nextIter.setCurrent(index);
		prevIter.setCurrent(index);
		
		// insert new row
		if(nextIter.hasNext()) {
			settings.appendFn([nextIter.next()]).then(function() {
				if(calcTrHeight) {
					/*
					 * Height calculation: After insterting the first row,
					 * we wait for it to get drawn. When it is ready, we
					 * use the first row's height to calculate margins.
					 */
			
					waitForRow().done(function(row) {
						const cs = window.getComputedStyle(row);
						const cssHeight = cs.getPropertyValue('height');
						const matches = cssHeight.match(/([\.\d]+)px/);
				
						if(matches) {
							settings.trHeight = parseFloat(matches[1]);
						} else {
							settings.trHeight = row.offsetHeight;
						}
					}).always(finalize);
				} else {
					finalize();
				}
			});
		} else {
			finalize();
		}

		return startDeferred.promise();
	};
	
	const resize = function() {
		const resizeDeferred = $.Deferred();
		
		waitForRow().done(function(row) {
			const cssHeight = window.getComputedStyle(row).getPropertyValue('height');
			var matches;
			const height = (matches = cssHeight.match(/([\.\d]+)px/)) ? parseFloat(matches[1]) : row.offsetHeight;
			
			if((height > 0) && (height != settings.trHeight)) {
				// height has changed
				settings.trHeight = height;
				
				const startIndex = focusedIndex ? focusedIndex : Math.min(Math.floor((prevIter.getCurrent() + nextIter.getCurrent()) / 2), settings.data.length -1);
				
				start(startIndex, false).then(function() {
					return center(startIndex);
				}).always(function() {
					resizeDeferred.resolve();
				});
			} else if(focusedIndex) {
				// height has not changed, but focuse row 
				// might have gone out of visible area
				focus(focusedIndex).always(function() { resizeDeferred.resolve(); });
			} else {
				// nothing to do
				resizeDeferred.resolve();
			}
		}).fail(function() {
			// no rows in table
			resizeDeferred.reject();
		});
		
		return resizeDeferred.promise();
	};
	
	const init = function() {
		// remove old event handlers
		that.off('scroll');
		that.off('tableWindow:focus');
		that.off('tableWindow:resize');
		
		// Temporarily setting the overflow property to 'hidden'
		// during initialisation fixes a bug related to scrollTop 
		// being unchangeable.
		// See: https://code.google.com/p/android/issues/detail?id=19625#c25
		that.css({'overflow-y': 'hidden'});

		start(settings.startIndex, true).then(function() {
			focusedIndex = settings.startIndex;
			return center(settings.startIndex);
		}).then(update).always(function() {
			// reset overflow to 'scroll'
			that.css({'overflow-y': 'scroll'});

			if(typeof(settings.onInit) == 'function') {
				settings.onInit();
			}

			// add event handlers
			that.on('scroll', function() {
				update();
			});
			//(that[0]).addEventListener('scroll', update, {passive: true});
			//(that[0]).addEventListener('touchmove', update, {passive: true});
			that.on('tableWindow:focus', function(event, index, callback) {
				focus(index).done(function() {
					if(typeof(callback) === 'function') {
						callback();
					}
				});
			});
			that.on('tableWindow:resize', function() {
				if(!resizeAnimationWorking) {
					resizeAnimationWorking = true;
					resize().then(update).always(function() {
						resizeAnimationWorking = false;
					});
				}
			});
		});
	};
	init();
	
	return this;
}
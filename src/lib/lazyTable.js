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
			},
			prependFn: function(rows) { 
				tableBody.prepend(rows.join()); 
			},
			deleteFn: function(startIndex, endIndex) { 
				tableBody.children().slice(startIndex, endIndex).remove();
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
	var resizeAnimationWorking = false;
	var focusedIndex = false;

	const waitForRow = function() {
		return new Promise((resolve, reject) => {
			var tries = 1;
			const wait = function() {
				const rows = tableBody.children();
				if(rows.length > 0) {
					// wait one frame before resolving
					window.setTimeout(function() { resolve(rows.get(0)); }, 16);
				} else if(tries++ < 10){
					// retry
					window.setTimeout(wait, 100);
				} else {
					reject();
				}
			};
			wait();
		});
	};

	const build = function(getFn, testFn) {
		return new Promise((resolve, reject) => {
			const anim = function(taskStartTime) {
				const html = [];
				
				while(testFn() && (window.performance.now() - taskStartTime < settings.animationCalcTime)) {
					html.push(getFn());
				}
				
				if(testFn()) {
					window.requestAnimationFrame(anim);
				} else {
					resolve(html);
				}
			};
			
			window.requestAnimationFrame(anim);			
		});
	};

	const free = function() {
		const currentWindow = calcCurrentWindow();
		const targetWindow = calcTargetWindow();
		
		if(targetWindow.bottom < currentWindow.bottom) {
			nextIter.setCurrent(targetWindow.bottom);
			settings.deleteFn(targetWindow.bottom - currentWindow.bottom); // index will be negative - so removed from the end of the list
			table.css({'margin-bottom': (settings.data.length - targetWindow.bottom) * settings.trHeight});
			if(settings.debug) {
				console.log('[jQuery.Lazytable] bot -' + (currentWindow.bottom - targetWindow.bottom) + ' rows');					
			}			
		}
		if(targetWindow.top > currentWindow.top) {
			prevIter.setCurrent(targetWindow.top);
			settings.deleteFn(0, targetWindow.top - currentWindow.top);
			table.css({'margin-top': targetWindow.top * settings.trHeight});
			if(settings.debug) {
				console.log('[jQuery.Lazytable] top -' + (targetWindow.top - currentWindow.top) + ' rows');					
			}
		}
	};

	/*
	 * Get the desired window based on current scroll position.
	 */
	const calcTargetWindow = function() {
		const scrollTop = that.scrollTop();
		const w = {
			top: Math.max(Math.floor(scrollTop / settings.trHeight) - settings.prefetch, 0),
			bottom: Math.min(Math.ceil((scrollTop + that.innerHeight()) / settings.trHeight) + settings.prefetch, settings.data.length - 1)
		};
		w.center = Math.min(Math.floor((w.bottom + w.top) / 2), settings.data.length - 1);
		
		return w;
	};
	
	/* 
	 * Get the currently drawn window.
	 */
	const calcCurrentWindow = function() {
		const w = {
			top: prevIter.getCurrent(),
			bottom: nextIter.getCurrent()
		};
		w.center = Math.min(Math.floor((w.bottom + w.top) / 2), settings.data.length - 1);
		
		return w;
	};
	
	const update = function() {
		const targetWindow = calcTargetWindow();
		const currentWindow = calcCurrentWindow();

		var animations = [];
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
				console.log('[jQuery.Lazytable] nVisible: ' + n);
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

		if(targetWindow.top > currentWindow.bottom || targetWindow.bottom < currentWindow.top) {
			console.log('RESET');
			animations.push(restart(targetWindow.center));
		} else {
			if(targetWindow.bottom >= currentWindow.bottom) {
				console.log('ENQUEUE BOTTOM: ' + (targetWindow.bottom - currentWindow.bottom + 1));
				animations.push(build(
						() => nextIter.next(),
						() => nextIter.hasNext() && nextIter.getCurrent() <= targetWindow.bottom
						).then(html => {
							if(html.length > 0) {
								settings.appendFn(html);
								table.css({'margin-bottom': (settings.data.length - nextIter.getCurrent()) * settings.trHeight});
								if(settings.debug) {
									console.log('[jQuery.Lazytable] bot +' + html.length + ' rows');
								}								
							}
						})
				);
			}
			if(targetWindow.top < currentWindow.top) {
				console.log('ENQUEUE TOP: ' + (currentWindow.top - targetWindow.top));
				animations.push(build(
						() => prevIter.prev(),
						() => prevIter.hasPrev() && prevIter.getCurrent() > targetWindow.top
						).then(html => {
							if(html.length > 0) {
								settings.prependFn(html.reverse());
								table.css({'margin-top': prevIter.getCurrent() * settings.trHeight});
								if(settings.debug) {
									console.log('[jQuery.Lazytable] top +' + html.length + ' rows');
								}								
							}
						})
				);				
			}
		}
		
		return Promise.all(animations).then(finalizeRedraw);
	};
	
	/* Move index to center of window, if possible. */
	const center = function(index) {
		return new Promise((resolve, reject) => {
			const top = Math.min(
					Math.max(index * settings.trHeight - (that.innerHeight() - settings.trHeight)/2, 0),
					that.prop('scrollHeight')
			);
			that.scrollTop(top);
			window.setTimeout(resolve, 16);			
		});
	};
	
	const focus = function(index) {
		const currentWindow = calcCurrentWindow();
		focusedIndex = index;
		
		if(currentWindow.top <= index && index < currentWindow.bottom) {
			return new Promise((resolve, reject) => {
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
				window.setTimeout(resolve, 16);				
			});
		}

		/*
		 * Else: If desired index is not within currently active area,
		 * the table will be rebuilt from scratch. 
		 */
		return restart(index);
	};
	
	const restart = function(index) {
		return start(index, false).then(function() {
			return center(index);
		}).then(update);
	};
	
	const start = function(index, calcTrHeight) {
		return new Promise((resolve, reject) => {
			const finalize = function() {
				const paddingTop = index * settings.trHeight;
				const height = settings.trHeight * settings.data.length;
				const paddingBottom = height - paddingTop - settings.trHeight;
			
				table.css({
					'margin-bottom': paddingBottom,
					'margin-top': paddingTop,
				});
				
				resolve();
			};
			
			// remove all table elements
			settings.deleteFn(0);
			
			// start at element to be focused
			nextIter.setCurrent(index);
			prevIter.setCurrent(index);
			
			// insert new row
			if(nextIter.hasNext()) {
				settings.appendFn([nextIter.next()]);
				if(calcTrHeight) {
					/*
					 * Height calculation: After insterting the first row,
					 * we wait for it to get drawn. When it is ready, we
					 * use the first row's height to calculate margins.
					 */
			
					waitForRow().then(function(row) {
						const cs = window.getComputedStyle(row);
						const cssHeight = cs.getPropertyValue('height');
						const matches = cssHeight.match(/([\.\d]+)px/);
				
						if(matches) {
							settings.trHeight = parseFloat(matches[1]);
						} else {
							settings.trHeight = row.offsetHeight;
						}
					}).then(finalize);
				} else {
					finalize();
				}
			} else {
				finalize();
			}			
		});
	};
	
	const resize = function() {
		return waitForRow().then(row => {
			const cssHeight = window.getComputedStyle(row).getPropertyValue('height');
			var matches;
			const height = (matches = cssHeight.match(/([\.\d]+)px/)) ? parseFloat(matches[1]) : row.offsetHeight;
			
			if((height > 0) && (height != settings.trHeight)) {
				// height has changed
				settings.trHeight = height;
				
				const startIndex = focusedIndex ? focusedIndex : Math.min(Math.floor((prevIter.getCurrent() + nextIter.getCurrent()) / 2), settings.data.length -1);
				
				return restart(startIndex);
			}
			
			if(focusedIndex) {
				// height has not changed, but focuse row 
				// might have gone out of visible area
				return focus(focusedIndex);
			}			
		});
	};
	
	const init = function() {
		// remove old event handlers
		that.off('scroll');
		that.off('lazytable:focus');
		that.off('lazytable:resize');
		
		// Temporarily setting the overflow property to 'hidden'
		// during initialisation fixes a bug related to scrollTop 
		// being unchangeable.
		// See: https://code.google.com/p/android/issues/detail?id=19625#c25
		that.css({'overflow-y': 'hidden'});

		start(settings.startIndex, true).then(function() {
			focusedIndex = settings.startIndex;
			return center(settings.startIndex);
		}).then(update).then(function() {
			// reset overflow to 'scroll'
			that.css({'overflow-y': 'scroll'});

			if(typeof(settings.onInit) == 'function') {
				settings.onInit();
			}

			// add event handlers
			that.on('scroll', function() {
				update();
			});
			that.on('lazytable:focus', function(event, index, callback) {
				focus(index).then(function() {
					if(typeof(callback) === 'function') {
						callback();
					}
				});
			});
			that.on('lazytable:resize', function() {
				if(!resizeAnimationWorking) {
					resizeAnimationWorking = true;
					resize().then(update).finally(function() {
						resizeAnimationWorking = false;
					});
				}
			});
		});
	};
	init();
	
	return this;
}
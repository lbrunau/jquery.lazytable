export default function TableRowIterator(generatorFunction, rows) {
	this.generatorFunction = generatorFunction;
	this.rows = rows;
	this.current = 0;
}
(function() {
	this.clone = function() {
		var newIt = new TableRowIterator(this.generatorFunction);
		newIt.rows = this.rows;
		newIt.current = this.current;
		return newIt;
	};
	
	this.getCurrent = function() {
		return this.current;
	};
	
	this.setCurrent = function(index) {
		if(index >= 0 && index < this.rows.length) {
			this.current = index;
		}
	};
	
	this.next = function() {
		return this.generatorFunction(this.rows[this.current++]);
	};
	
	this.hasNext = function() {
		return this.current < this.rows.length;
	};
	
	this.prev = function() {
		return this.generatorFunction(this.rows[--this.current]);
	};
	
	this.hasPrev = function() {
		return this.current > 0;
	};
}).call(TableRowIterator.prototype);
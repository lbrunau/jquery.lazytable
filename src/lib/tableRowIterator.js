export default function TableRowIterator(generatorFunction, rows) {
	this.generatorFunction = generatorFunction;
	this.rows = rows;
	this.current = 0;
}
TableRowIterator.prototype.clone = function() {
	var newIt = new TableRowIterator(this.generatorFunction);
	newIt.rows = this.rows;
	newIt.current = this.current;
	return newIt;
};
TableRowIterator.prototype.getCurrent = function() {
	return this.current;
};

TableRowIterator.prototype.setCurrent = function(index) {
	if(index >= 0 && index < this.rows.length) {
		this.current = index;
	}
};

TableRowIterator.prototype.next = function() {
	return this.generatorFunction(this.rows[this.current++]);
};

TableRowIterator.prototype.hasNext = function() {
	return this.current < this.rows.length;
};

TableRowIterator.prototype.prev = function() {
	return this.generatorFunction(this.rows[--this.current]);
};

TableRowIterator.prototype.hasPrev = function() {
	return this.current > 0;
};
	

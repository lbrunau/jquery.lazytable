export const TableState = {
	EMPTY: 0,    /* Empty table */
	IDLE: 1,     /* Table drawn - no drawings pending */
	STARTING: 2, /* First row is being drawn - other rows pending */
	UPDATING: 3, /* Performing pending draws */
	RESETTING: 4 /* Waiting for any drawing operations to be canceled */
};

export const TableAction = {
	'START': 0,          /* Draw first row */
	'BUILD-START': 1,    /* Start drawing pending rows */
	'BUILD-COMPLETE': 2, /* All drawings completed */
	'NEAR-SCROLL': 3,    /* Scroll to a row within current window - possibly add further rows */
	'WIDE-SCROLL': 4,    /* Scroll to a row outside of current window - restart */
	'NEAR-FOCUS': 5,     /* Focus a row within the current window */
	'WIDE-FOCUS': 6      /* Focus a row outside the current window */
};

class StateMachine {
	constructor(initialState) {
		that = this;
		this.state = initialState;
		this.callbacks = [];
		this.transitions = {};
	}
	
	_addTransition(oldState, action, newState) {
		const that = this;
		if(!this.transitions[oldState]) {
			this.transitions[oldState] = {};
		}
		this.transitions[oldState][action] = newState;
	}
	
	_transitState(newState) {
		const oldState = this.state;
		this.state = newState;
		for(cb in this.callbacks) {
			cb(oldState, newState);
		}
	}
	
	trigger(action, promise) {
		if(this.tranistions[this.state] && this.transitions[this.state][action]) {
			if(typeof promise != 'undefined') {
				promise.then(this._transitState(this.transitions[this.state][action]));
			} else {
				this._transitState(this.transitions[this.state][action])
			}
		}
	}
	
	getState() {
		return this.state;
	}
	
	onStateEnter(state, callback) {
		if(typeof callback == 'function') {
			this.onChange(function(oldState, newState) {
				if(newState == state) {
					callback();
				}
			});
		}
	}
	
	onStateLeave(state, callback) {
		if(typeof callback == 'function') {
			this.onChange(function(oldState, newState) {
				if(oldState == state) {
					callback();
				}
			})
		}
	}
	
	onChange(callback) {
		if(typeof callback == 'function') {
			this.callbacks.push(callback);
		}
	}
};

export class TableStateMachine extends StateMachine {
	construct() {
		super(TableState.EMPTY);
		this._addTransition(TableState.EMPTY, TableAction.START, TableState.STARTED);
		
		this._addTransition(TableState.STARTED, TableAction.BUILD-START, TableState.UPDATING);
		this._addTransition(TableState.STARTED, TableAction.FOCUS, TableState.RESETTING);
		
		this._addTransition(TableState.UPDATING, TableAction.BUILD-COMPLETE, TableState.IDLE);
		this._addTransition(TableState.UPDATING, TableAction.BUILD-START, TableState.UPDATING);
		this._addTransition(TableState.UPDATING, TableAction.FOCUS, TableState.RESETTING);
		
		this._addTransition(TableState.IDLE, TableAction.BUILD-START, TableState.UPDATING);
		this._addTransition(TableState.IDLE, TableAction.FOCUS, TableState.RESETTING);
		
		this._addTransition(TableState.RESETTING, TableAction.FOCUS, TableState.RESETTING);
		this._addTransition(TableState.RESETTING, TableAction.START, TableState.STARTED);
		
		this.resetPromise = false;
	}
};
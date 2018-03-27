/* ******************************************************************
 * 
 *                                     scroll
 *                                     +----+
 *                                     |    |
 *          start             scroll   v    |  scroll-complete
 * (EMPTY) ------> (STARTING) -----> (UPDATING) -------------> (IDLE)
 *                   ^    |            |    ^                   |  |
 *                   |    |            |    |       scroll      |  |
 *                   |    |       reset|    +-------------------+  |
 *                   |    |            |                           |
 *                   |    |  reset     v               reset       |
 *                   |    +--------> (RESETTING) <-----------------+
 *                   |                 |
 *                   +-----------------+
 *                         start
 *                         
 * ******************************************************************
 */
export const TableState = {
	EMPTY:     1, /* Empty table */
	IDLE:      2, /* Table drawn - no drawings pending */
	STARTING:  3, /* First row is being drawn - other rows pending */
	UPDATING:  4, /* Performing pending draws */
	RESETTING: 5  /* Waiting for any drawing operations to be canceled */
};

export const TableAction = {
	START:           1,
	START_COMPLETE:  2,
	RESET:           3,
	SCROLL:          4,
	SCROLL_COMPLETE: 5
};

class StateMachine {
	constructor(initialState) {
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
		for(let cb of this.callbacks) {
			cb(oldState, newState);
		}
	}
	
	trigger(action, promise) {
		const that = this;
		if(this.transitions[this.state] && this.transitions[this.state][action]) {
			return new Promise((resolve, reject) => {
				const finalize = () => {
					that._transitState(that.transitions[that.state][action]);
					resolve();
				};
				if(typeof promise == 'function') {
					promise().then(finalize);
				} else {
					finalize();
				}			
			});
		}
		// else:
		console.error('Undefined state transition: {state: ' + this.state + ', action: ' + action + '}');
		console.trace();
	}
	
	getState() {
		return this.state;
	}
	
	onStateEnter(state, callback) {
		if(typeof callback == 'function') {
			this.onStateChange(function(oldState, newState) {
				if(newState == state) {
					callback();
				}
			});
		}
	}
	
	onStateLeave(state, callback) {
		if(typeof callback == 'function') {
			this.onStateChange(function(oldState, newState) {
				if(oldState == state) {
					callback();
				}
			})
		}
	}
	
	onStateChange(callback) {
		if(typeof callback == 'function') {
			this.callbacks.push(callback);
		}
	}
};

export class TableStateMachine extends StateMachine {
	constructor() {
		super(TableState.EMPTY);
		this._addTransition(TableState.EMPTY, TableAction.START, TableState.STARTING);
		
		this._addTransition(TableState.STARTING, TableAction.SCROLL, TableState.UPDATING);
		this._addTransition(TableState.STARTING, TableAction.RESET, TableState.RESETTING);
		
		this._addTransition(TableState.UPDATING, TableAction.SCROLL_COMPLETE, TableState.IDLE);
		this._addTransition(TableState.UPDATING, TableAction.SCROLL, TableState.UPDATING);
		this._addTransition(TableState.UPDATING, TableAction.RESET, TableState.RESETTING);
		
		this._addTransition(TableState.IDLE, TableAction.SCROLL, TableState.UPDATING);
		this._addTransition(TableState.IDLE, TableAction.RESET, TableState.RESETTING);
		
		this._addTransition(TableState.RESETTING, TableAction.RESET, TableState.RESETTING);
		this._addTransition(TableState.RESETTING, TableAction.START, TableState.STARTING);
	}
};
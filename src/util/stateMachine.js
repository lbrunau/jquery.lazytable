/**
 * This class is a generic implementation of a finite state machine.
 * 
 * You should initialize it with a start state and add some transitions to
 * the machine. You can then trigger state transitions using the "trigger"
 * method by providing the appropriate action definition and a callback or 
 * promise that should be performed during that transition.
 */
export default class StateMachine {
	
	/**
	 * Create a new StateMachine with a given initial state.
	 * The machine does not have any transitions yet.
	 */
	constructor(initialState) {
		this.state = initialState;
		this.callbacks = [];
		this.transitions = {};
	}
	
	addTransition(oldState, action, newState) {
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
		
		throw new Exception('Undefined state transition: {state: ' + this.state + ', action: ' + action + '}');
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

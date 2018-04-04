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
	 * Create a new StateMachine with a given initial state. The machine does 
	 * not have any transitions yet. You must add transitions before calling 
	 * the "trigger" method for the first time. Triggering an undefined 
	 * (state,action)-pair will raise an exception.
	 */
	constructor(initialState) {
		this.state = initialState;
		this.callbacks = [];
		this.transitions = {};
	}
	
	/**
	 * Add a transition from oldState when receiving a given action.
	 * The new state will be newState.
	 */
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
	
	/**
	 * Trigger an action. The state transition will be done 
	 * - immediately, if "promise" is a function or
	 * - or when "promise" is resolved, in case it is a Promise.
	 * 
	 * This method may throw an exception when no appropriate 
	 * transition has been defined.
	 */
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
		
		throw 'Undefined state transition: {state: ' + this.state + ', action: ' + action + '}';
	}
	
	
	/**
	 * Get the current state.
	 */
	getState() {
		return this.state;
	}
	
	
	/**
	 * Callback function that will be executed when a given state is entered.
	 */
	onStateEnter(state, callback) {
		if(typeof callback == 'function') {
			this.onStateChange(function(oldState, newState) {
				if(newState == state) {
					callback();
				}
			});
		}
	}
	
	
	/**
	 * Callback function that will be executed when a given state is left.
	 */
	onStateLeave(state, callback) {
		if(typeof callback == 'function') {
			this.onStateChange(function(oldState, newState) {
				if(oldState == state) {
					callback();
				}
			})
		}
	}
	
	
	/**
	 * Callback function that will be executed on any state change.
	 */
	onStateChange(callback) {
		if(typeof callback == 'function') {
			this.callbacks.push(callback);
		}
	}
};

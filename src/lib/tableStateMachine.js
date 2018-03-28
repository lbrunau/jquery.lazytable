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

import StateMachine from '../util/stateMachine.js';

export const TableState = {
	EMPTY:     1, /* Empty table */
	IDLE:      2, /* Table drawn - no drawings pending */
	STARTING:  3, /* First row is being drawn - other rows pending */
	UPDATING:  4, /* Performing pending draws */
	RESETTING: 5  /* Cancel all drawing operations */
};

export const TableAction = {
	START:           1,
	RESET:           2,
	SCROLL:          3,
	SCROLL_COMPLETE: 4
};

export class TableStateMachine extends StateMachine {
	constructor() {
		super(TableState.EMPTY);
		this.addTransition(TableState.EMPTY, TableAction.START, TableState.STARTING);
		
		this.addTransition(TableState.STARTING, TableAction.SCROLL, TableState.UPDATING);
		this.addTransition(TableState.STARTING, TableAction.RESET, TableState.RESETTING);
		
		this.addTransition(TableState.UPDATING, TableAction.SCROLL_COMPLETE, TableState.IDLE);
		this.addTransition(TableState.UPDATING, TableAction.SCROLL, TableState.UPDATING);
		this.addTransition(TableState.UPDATING, TableAction.RESET, TableState.RESETTING);
		
		this.addTransition(TableState.IDLE, TableAction.SCROLL, TableState.UPDATING);
		this.addTransition(TableState.IDLE, TableAction.RESET, TableState.RESETTING);
		
		this.addTransition(TableState.RESETTING, TableAction.RESET, TableState.RESETTING);
		this.addTransition(TableState.RESETTING, TableAction.START, TableState.STARTING);
	}
};
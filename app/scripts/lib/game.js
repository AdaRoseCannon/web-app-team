
var EventEmitter = require('events').EventEmitter;

class Game {
	constructor(options) {
		const _events = new EventEmitter();
		this.data = options;
		this.on = _events.on;
		this._fire = _events.fire;
	}

	init() {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, 500 + Math.random() * 3000);
		});
	}
}

module.exports = Game;

var EventEmitter = require('events').EventEmitter;

class Player {
	constructor(options) {
		this.data = options;
	}
}

class Game {
	constructor(options) {
		const _events = new EventEmitter();
		this.data = options;
		this.on = _events.on;
		this._fire = _events.emit;
		this.player = new Player(options);

		setInterval(() => this._fire('newPlayer', this.player), 3000);
	}

	init() {
		return new Promise((resolve) => {
			setTimeout(resolve, 500 + Math.random() * 3000);
		});
	}
}

module.exports = Game;
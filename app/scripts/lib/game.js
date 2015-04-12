
const EventEmitter = require('events').EventEmitter;
const extend = require('util')._extend;

class Player {
	constructor(options) {
		this.data = options;
	}
}

class Job {
	constructor(options = {}) {
		this.data = extend({
			message: "New Job!!",
			number: Math.floor(Math.random() * 100000) + 10000
		}, options);
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

	start() {
		setInterval(() => this._fire('recievedJob', new Job()), 5000);
		return Promise.resolve();
	}
}

module.exports = Game;
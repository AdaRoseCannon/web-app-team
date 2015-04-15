
const EventEmitter = require('events').EventEmitter;
const extend = require('util')._extend;
const Peer = require('peerjs');
const templates = require('./templates');
const utils = require('./utils');

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

function host() {
	return new Promise((resolve) => {
		setTimeout(resolve, 500 + Math.random() * 3000);
	});
}

function client() {
	return new Promise((resolve) => {
		setTimeout(resolve, 500 + Math.random() * 3000);
	});
}

class Game {
	constructor() {
		this.data = {};
		const _events = new EventEmitter();
		this.on = _events.on;
		this._fire = _events.emit;
		this.data.flexibleName = true;
	}

	getTeamName(dom, retries = 0) {
		const maxRetries = 5;
		function nameGen() {
			const name = utils.randomFrom(templates.companyName.endingInEr);
			return name.substr(0, name.length - 2) + "r";
		}

		return new Promise((resolve, reject) => {
			var name = nameGen();
			if (retries === maxRetries) {
				name = Math.floor(Math.random() * 100000);
			}
			const t = setTimeout(() => resolve(name), 2000);
			this.data.peer = new Peer(name, {
					host: location.hostname,
					path:"/peerjs",
					port: "9000",
					debug: 2
				})
				.on('error', e => {
					clearTimeout(t);
					if (
						e.message.indexOf("is taken") !== -1 &&
						retries < maxRetries
					) {
						console.log(retries);
						return this.getTeamName(dom, retries + 1);
					} else {
						reject(e);
					}
				});
		}).then(name => {
			this.data.team = name;
			$(dom).html(name);
		}, err => {
			$(dom).html(err.message);
		});
	}

	init(options) {
		this.data = extend(this.data, options);
		this.player = new Player(options);
		this.sprint = 1;
		setTimeout(() => this._fire('newPlayer', this.player), 3000);

		if (this.data.hosting) {
			return host.bind(this)();
		} else {
			return client.bind(this)();
		}
	}

	start() {
		setInterval(() => this._fire('recievedJob', new Job()), 5000);
		return Promise.resolve();
	}
}

module.exports = Game;
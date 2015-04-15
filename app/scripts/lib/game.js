
const EventEmitter = require('events').EventEmitter;
const extend = require('util')._extend;
const Peer = require('peerjs');
const templates = require('./templates');
const utils = require('./utils');
const peerSettings = {
	host: location.hostname,
	path:"/peerjs",
	port: "9000",
	debug: 2
};

function sendData(dataConn, type, data) {
	dataConn.send({
		type: type,
		data: data
	});
}

class Player {
	constructor(options) {
		this.data = {};
		['id', 'name', 'role', 'team', 'hosting'].forEach(prop => {
			if (options[prop] === undefined) {
				throw Error('Missing player property', prop);
			}
			this.data[prop] = options[prop];
		});
		if (options.dc) {
			this.dc = options.dc;
		}
	}

	sendData(type, data) {
		if (this.dc) {
			sendData(this.dc, type, data);
		} else {
			throw Error('No connection to player');
		}
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

function globalFire(eventType, eventData) {
	var data = {
		eventType,
		eventData
	};
	if (this.data.hosting) {

		// Fire the event locally
		this._fire(data.eventType, data.eventData);

		this.data.players.forEach(p => {

			// Get all connected clients to fire the event
			if(p !== this.player) {
				p.sendData('event', data);
			}
		});
	} else {

		// Ask the host to send the event to everyone.
		sendData(this.hostDc, 'globalFireRequest', data);
	}
}

function _addPlayer(player) {
	this.data.players.push(player);
	this._fire('newPlayer', player);
}

// Wait for players to connect.
function _host() {
	this.peer.on('connection', dataConn => {
		console.log('Connection recieved from', dataConn.peer);
		dataConn.on('data', data => {
			console.log('Data recieved from', dataConn.peer, data);
			if (data.type === 'join') {
				console.log('That data was a join request');
				const playerData =  extend({
					dc: dataConn,
					id: dataConn.peer
				}, data.data);

				// Send the data from each player
				sendData(dataConn, 'welcome', this.data.players.map(p => p.data));

				const newPlayer = new Player(playerData);
				_addPlayer.bind(this)(newPlayer);
			}
			if (data.type === 'globalFireRequest') {
				globalFire.bind(this)(data.data.eventType, data.data.eventData);
			}
		});
		setTimeout(() => sendData(dataConn, 'ready'), 100);
	});
	return Promise.resolve(new Player(extend(this.data, {id: this.data.team})));
}

// Connect to the host and recieve a list of players.
function _client() {
	return new Promise((resolve, reject) => {
		this.peer.destroy();
		this.peer =  new Peer(peerSettings)
			.on('open', resolve)
			.on('error', reject);
	}).then(() => {
		return new Promise((resolve, reject) => {
			var dataConn = this.peer.connect(this.data.team)
				.on('data', data => {
					if (data.type === 'ready') {
						resolve(dataConn);
					}})
				.on('error', reject);
		});
	}).then(dataConn => {

		window.addEventListener("beforeunload", () => globalFire.bind(this)('playerDisco', this.player.data));

		sendData(dataConn, 'join', this.data);
		dataConn.on('data', data => {
			if (data.type === 'welcome') {
				data.data.forEach(d => _addPlayer.bind(this)(new Player(d)));
				this.hostDc = dataConn;
			}
			if (data.type === 'event') {
				this._fire(data.data.eventType, data.data.eventData);
			}
		});

		return new Player(extend({
			id: this.peer.id
		}, this.data));
	}).catch(e => {
		console.log("Error", e);
	});
}

class Game {
	constructor() {

		window.globalFire = globalFire.bind(this);
		this.data = {};
		const _events = new EventEmitter();
		this.on = _events.on;
		this._fire = _events.emit;
		this.data.flexibleName = true;
		this.data.players = [];
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
			this.peer = new Peer(name, peerSettings)
				.on('error', e => {
					if (
						e.message.indexOf("is taken") !== -1 &&
						retries < maxRetries
					) {
						console.log(retries);
						return this.getTeamName(dom, retries + 1);
					} else {
						reject(e);
					}
				})
				.on('open', resolve);
		}).then(name => {
			this.data.team = name;
			$(dom).html(name);
		}, err => {
			$(dom).html(err.message);
		});
	}

	init(options) {
		this.data = extend(this.data, options);

		return Promise.resolve().then(() => {
			if (this.data.hosting) {
				return _host.bind(this)();
			} else {
				return _client.bind(this)();
			}
		}).then (player => {

			// Add self to the player list
			this.player = player;
			setTimeout(() => _addPlayer.bind(this)(player), 1000);


			this.on('playerDisco', p => {
				console.log(this.data.players.length);
				this.data.players = this.data.players.filter(i => {
					return p.id !== i.data.id;
				});
				console.log(this.data.players.length);
			});
		});
	}

	start() {
		setInterval(() => this._fire('recievedJob', new Job()), 5000);
		return Promise.resolve();
	}
}

module.exports = Game;
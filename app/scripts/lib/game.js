
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

class Player {
	constructor(options) {
		this.data = {};
		['name', 'role', 'team', 'hosting'].forEach(prop => {
			if (options[prop] === undefined) {
				throw Error('Missing player property', prop);
			}
			this.data[prop] = options[prop];
		});
		['peer', 'dc'].forEach(prop => {
			if (options[prop]) {
				this[prop] = options[prop];
			}
		});
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

function sendData(dataConn, type, data) {
	dataConn.send({
		type: type,
		data: data
	});
}

function _addPlayer(player) {
	this.data.players[player.id] = player;
	if (player.hosting) {
		this.data.host = player;
	}
	this._fire('newPlayer', player);
}

// Wait for players to connect.
function _host() {
	this.data.hostData = {
		players: {}
	};
	this.peer.on('connection', dataConn => {
		console.log('Connection recieved from', dataConn.peer);
		dataConn.on('data', data => {
			console.log('Data recieved from', dataConn.peer, data);
			if (data.type === 'join') {
				console.log('That data was a join request');
				const playerData =  extend({
					dc: dataConn,
					peer: dataConn.peer
				}, data.data);

				const newPlayer = new Player(playerData);
				this.data.hostData.players[playerData.peer] = newPlayer;
				_addPlayer.bind(this)(newPlayer);
			}
		});
		setTimeout(() => sendData(dataConn, 'ready'), 100);
	});
	return Promise.resolve(new Player(this.data));
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
			console.log("Connecting, id:", this.peer.id, "connecting to", this.data.team);
			var dataConn = this.peer.connect(this.data.team)
				.on('data', data => {
					if (data.type === 'ready') {
						resolve(dataConn);
					}})
				.on('error', reject);
		});
	}).then(dataConn => {
		console.log('Connected sending join request');
		sendData(dataConn, 'join', this.data);
		dataConn.on('data', data => {
			if (data.type === 'welcome') {
				data.players.forEach(p => _addPlayer.bind(this)(new Player(p)));
			}
		});
		return new Player(extend({
			dc: dataConn,
			peer: dataConn.peer,
			id: dataConn.peer.id
		}, this.data));
	}).catch(e => {
		console.log("Error", e);
	});
}

// Fired Events Go To All Peers
// Events from Peers fire an event
function _setUpGlobalEvents() {
	const oldFire = this._fire;
	this._fire = function (...args) {
		oldFire.apply(args);
		if (this.data.hosting) {

		} else {
		}
	}.bind(this);

	if (!this.data.hosting) {
		this.data.host.dc.on('data', function () {
			if (data.type === 'event') {
				oldFire(data.event.type, data.event.data);
			}
		});
	}
}

class Game {
	constructor() {
		this.data = {};
		const _events = new EventEmitter();
		this.on = _events.on;
		this._fire = _events.emit;
		this.data.flexibleName = true;
		this.data.players = {};
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
			setTimeout(() => _addPlayer.bind(this)(player), 3000);
		});
	}

	start() {
		setInterval(() => this._fire('recievedJob', new Job()), 5000);
		return Promise.resolve();
	}
}

module.exports = Game;
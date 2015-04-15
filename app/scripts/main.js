const hogan = require('hogan');
const templates = require('./lib/templates');
const utils = require('./lib/utils');
const Game = require('./lib/game');
const Peer = require('peerjs');
window.Peer = Peer;

function animateHeightChange(f, el, children, options, callback) {

	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	let dBefore = el.getBoundingClientRect();
	children.forEach(c => $(c).data('old', c.getBoundingClientRect()));
	f();

	let dAfter = el.getBoundingClientRect();
	var scaleChange = {
		width: dAfter.width/dBefore.width,
		height: dAfter.height/dBefore.height
	};

	children.forEach(c => {

		// Ignore elements removed from the dom
		if (!c.parentElement) {
			return;
		}
		let oldPos = $(c).data('old');
		let newPos = c.getBoundingClientRect();
		let cDiffs = {
			top: (oldPos.top - dBefore.top) * (scaleChange.height - 1) + (oldPos.top - newPos.top),
			left: (oldPos.left - dBefore.left) * (scaleChange.width - 1) + (oldPos.left - newPos.left)
		};
		$(c).data('old', null);
		c.style.transformOrigin = "0 0 0";
		c.style.transition = "0s";
		c.style.transform = `scale(${scaleChange.width}, ${scaleChange.height}) translate(${cDiffs.left}px, ${cDiffs.top}px)`;
	});

	let oldStyle = window.getComputedStyle(el);
	let oldStyleTransform = oldStyle.transform;
	let oldStyleTransition = oldStyle.transition;
	el.style.transformOrigin = "0 0 0";
	el.style.transition = "0s";
	el.style.transform = `${oldStyleTransform} scale(${1/scaleChange.width}, ${1/scaleChange.height})`;
	el.style.overflow = "hidden";

	function postTransition() {
		el.style.transition = oldStyleTransition;
		el.style.transform = oldStyleTransform;

		if (callback) {
			$(el).one("transitionend", () => {
				callback();
			});
		}

		children.forEach(c => {
			c.style.transition = oldStyleTransition;
			c.style.transform = 'scale(1, 1)';
		});
		$(el).off("transitionend", postTransition);
	}

	$(el).on("transitionend", postTransition);
	setTimeout(postTransition, 32);
}

const originalModal = $('.modal').html();
function resetModal() {
	$('.modal').html(originalModal);
}

function closeModal(e) {
	const m = $('.modal');
	const b = $('.modal-backdrop');
	m.hide(e);
	b.hide(200, b.remove);
}
$('.modal').on('hide.bs.modal', () => setTimeout(resetModal, 500));

$('#web-team-begin').on('click', () => $('.modal').modal());
$('#toggle-host').on('change', e => {
	let t = $('.toggle-wrap');
	t.fadeTo(0, 0);
	animateHeightChange(() => e.currentTarget.checked ? t.addClass('host') : t.removeClass('host'), $('.modal-dialog')[0], Array.prototype.slice.call($('.modal-dialog')[0].querySelectorAll('.modal-body > .form-group')).concat($('.modal-header')[0]).concat($('.modal-footer')[0]), () => {
		t.fadeTo(300, 1);
	});
});
new Promise(resolve => {
	$('#modal-okay').on('click', () => {
		var msg = hogan.compile(templates.mixins.joining);
		var name = $('#name-input').val();
		var role = hogan.compile(templates.mixins.roleFormat).render({
			prefix: utils.randomFrom(templates.role.prefixes),
			role: utils.randomFrom(templates.role.roles),
			title: utils.randomFrom(templates.role.titles)
		});
		var hosting = $('#toggle-host').val();
		var team = hosting ? $('#peerjs-id').html() : $('#team-code-input').val();
		var started = false;
		$('.toggle-hosting, .form-group.name').fadeTo(300, 0, () => {
			if (started) return;
			started = true;
			setTimeout(() => animateHeightChange(() => {
				$('.modal-dialog').addClass('connecting');
				$('.form-group.name').html(msg.render({
					name: name,
					role: role,
					team: team
				}, templates.mixins));
				$('.form-group.name').fadeTo(300, 1);
				const game = new Game({
					hosting,
					role,
					team,
					name
				});
				game.init().then(() => {
					$('.form-group.name .panel-info').removeClass('panel-info').addClass('panel-success');
					this.setTimeout(() => {
						closeModal();
					}, 1500);
					resolve(game);
				});
			}, $('.modal-dialog')[0], Array.prototype.slice.call($('.modal-dialog')[0].querySelectorAll('.modal-body')).concat($('.modal-header')[0]).concat($('.modal-footer')[0])), 300);
		});
	});
}).then(game => {
	return new Promise(resolve => {
		$('.workspace').removeClass('introduction').addClass('waiting');
		const notification = hogan.compile(templates.mixins.notification);
		game.on('newPlayer', p => {
			let newPlayerNotification = $(notification.render({
				message: `${p.data.name} has joined from company-X as your new ${p.data.role}`
			}, templates.mixins));
			newPlayerNotification.fadeTo(0, 0).fadeTo(300, 1);
			$('#notifications-target').append(newPlayerNotification);
			setTimeout(() => {
				newPlayerNotification.fadeTo(300, 0, () => {

					// TODO: Make this render nicely
					animateHeightChange(
						() => newPlayerNotification.remove(),
						$('#notifications-target')[0],
						Array.prototype.slice.call($('#notifications-target')[0].querySelectorAll('.alert'))
					);
				});
			}, 6000);
		});

		$('#game-start').on('click', () => {
			game.start().then(() => resolve(game));
		});
	});
}).then (game => {
	$('.workspace').removeClass('waiting').addClass('playing');

	game.on('recievedPanel', () => {

	}).on('recievedJob', ticket => {
		$('#job-target').html(hogan.compile(templates.mixins.ticket).render(ticket.data));
	}).on('timeout', () => {

	}).on('complete', () => {

	});

});

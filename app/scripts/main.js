const hogan = require('hogan');
const templates = require('./lib/templates');
const utils = require('./lib/utils');
const Game = require('./lib/game');
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

$('#toggle-host').on('change', e => {
	let t = $('.toggle-wrap');
	t.fadeTo(0, 0);
	utils.animateHeightChange(() => e.currentTarget.checked ? t.addClass('host') : t.removeClass('host'), $('.modal-dialog')[0], Array.prototype.slice.call($('.modal-dialog')[0].querySelectorAll('.modal-body > .form-group')).concat($('.modal-header')[0]).concat($('.modal-footer')[0]), () => {
		t.fadeTo(300, 1);
	});
});

Promise.resolve().then(() => {
	const game = new Game();

	$('#web-team-begin').on('click', () => {
		$('.modal').modal();
	});

	return game.getTeamName($('#peerjs-id')).then(() => Promise.resolve(game));
}).then(game => {
	return new Promise(resolve => {
		$('#modal-okay').on('click', () => {
			var msg = hogan.compile(templates.mixins.joining);
			var name = $('#name-input').val();
			var role = hogan.compile(templates.mixins.roleFormat).render({
				prefix: utils.randomFrom(templates.role.prefixes),
				role: utils.randomFrom(templates.role.roles),
				title: utils.randomFrom(templates.role.titles)
			});
			var hosting = $('#toggle-host')[0].checked;
			var team = hosting ? $('#peerjs-id').html() : $('#team-code-input').val().toLowerCase();

			// Update the name field on click
			$($('.toggle-hosting, .form-group.name')[0]).fadeTo(300, 0, () => {
				setTimeout(() => utils.animateHeightChange(() => {
					$('.modal-dialog').addClass('connecting');
					$('.form-group.name').html(msg.render({
						name, role, team, hosting
					}, templates.mixins));
					$('.form-group.name').fadeTo(300, 1);
					game.init({
						hosting, role, team, name
					}).then(() => {
						$('.form-group.name .panel-info').removeClass('panel-info').addClass('panel-success');
						this.setTimeout(() => {
							closeModal();
						}, 1500);
						resolve(game);
					});
				}, $('.modal-dialog')[0], Array.prototype.slice.call($('.modal-dialog')[0].querySelectorAll('.modal-body')).concat($('.modal-header')[0]).concat($('.modal-footer')[0])), 300);
			});
		});
	});
}).then(game => {
	return new Promise(resolve => {
		$('.workspace').removeClass('introduction').addClass('waiting');

		$('#banner-holder').html(hogan.compile(templates.mixins.banner).render(game.data));

		$('#game-start').on('click', () => {
			game.start().then(() => resolve(game));
		});

		$('#founders').append(`<thead><tr><th>Company Name</th><th>Name - Role</th></tr></thead>`);

		game.on('newPlayer', p => {
			$('#founders').append(hogan.compile(templates.mixins.rolecall).render(p.data, templates.mixins));
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

}).catch(e => {
	setTimeout(() => {
		throw e;
	});
});

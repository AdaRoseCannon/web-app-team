$('#web-team-begin').on('click', () => $('.modal').modal());
$('#toggle-host').on('change', e => {
	let t = $('.toggle-wrap');
	t.fadeTo(0, 0);
	animateHeightChange(() => e.currentTarget.checked ? t.addClass('host') : t.removeClass('host'), $('.modal-dialog')[0], Array.prototype.slice.call($('.modal-dialog')[0].querySelectorAll('.modal-body > .form-group')).concat($('.modal-header')[0]).concat($('.modal-footer')[0]), () => {
		t.fadeTo(300, 1);
	});
});

function animateHeightChange(f, el, children, callback) {
	let dBefore = el.getBoundingClientRect();
	f();
	let dAfter = el.getBoundingClientRect();
	var scaleChange = {
		width: dAfter.width/dBefore.width,
		height: dAfter.height/dBefore.height
	};
	let oldStyle = window.getComputedStyle(el);
	let oldStyleTransform = oldStyle.transform;
	let oldStyleTransition = oldStyle.transition;
	el.style.transformOrigin = "0 0 0";
	el.style.transition = "0s";
	el.style.transform = `${oldStyleTransform} scale(${1/scaleChange.width}, ${1/scaleChange.height})`;
	el.style.overflow = "hidden";

	children.forEach(c => {
		let cBefore = c.getBoundingClientRect();
		let cDiffs = {
			top: (cBefore.top - dBefore.top) * (scaleChange.height - 1),
			left: (cBefore.left - dBefore.left) * (scaleChange.width - 1)
		};
		c.style.transformOrigin = "0 0 0";
		c.style.transition = "0s";
		c.style.transform = `scale(${scaleChange.width}, ${scaleChange.height}) translate(${cDiffs.left}px, ${cDiffs.top}px)`;
	});

	requestAnimationFrame(() => {
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
	});
}
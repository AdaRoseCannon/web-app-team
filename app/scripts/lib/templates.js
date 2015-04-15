module.exports = {
	mixins: {
		businessCard: "{{{name}}} - {{{role}}}",
		roleFormat: '{{{prefix}}} {{{role}}} {{{title}}}',
		joining:   `
			<div class="panel panel-info">
				<div class="panel-heading">
					<h3 class="panel-title">
						{{^hosting}}Attempting to join {{{team}}}{{/hosting}}
						{{#hosting}}Hosting statup {{{team}}}{{/hosting}}
					</h3>
				</div>
				<div class="panel-body">
					{{> businessCard }}
				</div>
			</div>`,
		notification: `
			<div class="alert alert-dismissable alert-info">
                <button type="button" class="close" data-dismiss="alert">×</button>{{{message}}}
            </div>
		`,
		ticket: `
			<div class="alert alert-info">
				Ticket #{{{number}}}: {{{message}}}
			</div>
		`,
		banner: `
			<h1 class="welcome banner">Welcome to '{{{team}}}'</h1>
		`,
		rolecall: `
			<tr><td>{{{team}}}</td><td>{{> businessCard }}</td></tr>
		`
	},
	role: {
		titles: [
			'Ninja',
			'Guru',
			'Engineer',
			'Intern',
			'Evangelist',
			'Developer'
		],
		roles: [
			'JavaScript',
			'Backend',
			'Frontend',
			'Coffee Script',
			'Testing',
			'QA',
			'Full Stack',
			'Social Media',
			'Networking',
			'Java',
			'PHP',
			'Ruby'
		],
		prefixes: [
			'Lead',
			'Junior',
			'Senior',
			'Managing',
			'10x'
		]
	},
	companyName: {
		endingInEr: [
			"administer", "alter", "anger", "answer", "banter",
			"barter", "beleaguer", "better", "bewilder", "bicker",
			"blabber", "blister", "blubber", "blunder", "bluster",
			"bolster", "canter", "cater", "charter", "chatter",
			"clamber", "clobber", "cluster", "clutter",
			"confer", "conquer", "consider", "cover", "cower",
			"decipher", "defer", "deflower", "deliver",	"deter", "dicker",
			"differ", "discover", "dismember", "dither", "dodder",
			"embitter", "embroider", "encounter", "encumber",
			"endanger", "enter", "falter", "fester",
			"filibuster", "filter ", "flatter", "flitter", "flounder",
			"fluster", "flutter", "foster", "further", "garner",
			"gather", "gerrymander", "glimmer", "glitter", "glower", "hanker",
			"hinder", "holler", "hover", "infer", "jabber",
			"launder", "limber", "linger",
			"litter", "loiter", "lower", "lover", "maneuver", "master",
			"matter", "meander", "murder", "muster", "mutter",
			"order", "pamper", "patter", "pester",
			"philander", "pilfer", "plunder", "ponder", "prefer", "prosper",
			"putter", "quiver", "refer", "register", "remember",
			"render", "saunter", "scamper", "scatter", "sequester",
			"sever", "shatter", "shimmer", "shiver", "simmer",
			"simper", "slander", "slaughter", "slither", "slobber",
			"slumber", "smolder", "smother", "snicker",
			"solder", "splatter", "sputter", "squander", "stagger",
			"stammer", "stutter", "suffer", "surrender",
			"swagger", "swelter", "tamper", "taper", "teeter",
			"thunder", "tinker", "titter", "totter", "transfer",
			"twitter", "upholster", "utter", "wager",
			"wander", "whimper", "wither", "wonder", "yammer"
		],
	}
};
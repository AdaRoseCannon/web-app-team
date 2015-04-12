module.exports = {
	mixins: {
		businessCard: "{{{name}}} - {{{role}}}",
		roleFormat: '{{{prefix}}} {{{role}}} {{{title}}}',
		joining:   `
			<div class="panel panel-info">
				<div class="panel-heading">
					<h3 class="panel-title">Attempting to join {{{team}}}</h3>
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
	}

};
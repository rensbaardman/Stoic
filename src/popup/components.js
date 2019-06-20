function generateBody(header, main, footer, status) {
	return `<body${status ? '>' : ' class="disabled">'}
	${header}
	${main}
	${footer}
</body>`
}

function generateHeader(host, active) {
	return `<header>
	<img id="logo" src="../assets/stoic-48.png" />
	<div>
		<h1>Stoic</h1>
		<p><span id="status">${active ? 'active' : 'disabled'}</span> on <span id='url'>${host}</span></p>
	</div>
	<div class="toggle toggle-large">
		<input type="checkbox" id="toggle-status"${active ? ' checked' : ''}/>
		<label for="toggle-status"></label>
	</div>
</header>`
}

function generateCategories(categories) {
	// categories should be an array
	// containing category objects
	return `<main>
	<ul class="categories">
		${categories.map(generateCategory).join('\n')}
	</ul>
</main>`
}

function generateCategory(category) {
	// category should be a Category Object
	return `<li class="category${category.active ? ' active' : ''}${category.overriden ? ' overriden' : ''}${category.opened ? ' opened' : ''}" id="cat-${category.id}">

	<div class="category-name">
		<span class="override-indicator"></span>
		<h3>${category.name}</h3>

		<div class="toggle">
			<input type="checkbox" id="toggle-cat-${category.id}"${category.active ? ' checked' : ''} />
			<label for="toggle-cat-${category.id}"></label>
		</div>
	</div>

	<ul class="rules">
		${category.rules.map(generateRule).join('\n')}
	</ul>

</li>`
}

function generateRule(rule) {
	return `<li class="rule${rule.override ? ' override' : ''}">
	${rule.desc}
	<div class="toggle toggle-small">
		<input type="checkbox" id="toggle-rule-${rule.id}" ${rule.active ? ' checked' : ''} />
		<label for="toggle-rule-${rule.id}"></label>
	</div>
</li>`
}

function generateFooter() {
	return `<footer>
	<p><img src='../assets/gear.png' /><a href='#'>Change global settings</a></p>
</footer>`
}


module.exports = {
	generateBody: generateBody,
	generateHeader: generateHeader,
	generateCategories: generateCategories,
	generateCategory: generateCategory,
	generateRule: generateRule,
	generateFooter: generateFooter
}

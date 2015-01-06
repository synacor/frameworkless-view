define([
	'view',
	'text!templates/index.html'
], function(view, template) {

	var route = {
		url : '/',

		events : {
			'click .alert' : 'alert',
			'click .log' : function(e) {
				console.log(e.delegationTarget);
			}
		},

		alert : function(e) {
			alert(e.delegationTarget.textContent);
		},

		load : function() {
			if (!this.view) {
				// initialize a view:
				this.view = view(template);

				// wire up event handlers:
				this.view.hookEvents(this.events, this);
			}

			this.view.render(dummyData);

			// insert view into DOM:
			this.view.insertInto('#main');
		},

		unload : function() {
			// remove view from DOM:
			this.view.remove();
		}
	};


	var dummyData = {
		title : "Example Template Data",
		list : {
			test : "test value",
			test2 : "test 2 value",
			test3 : "test 3 value",
		},
		arr : [
			"array value 1",
			"array value 2",
			"array value 3",
			"array value 4"
		],
		nest1 : {
			foo : [
				"nested level 2, item 1, child 1",
				"nested level 2, item 1, child 2",
				"nested level 2, item 1, child 3"
			],
			foo2 : [
				"nested level 2, item 2, child 1",
				"nested level 2, item 2, child 2"
			],
			foo3 : [
				"nested level 2, item 3, child 1",
				"nested level 2, item 3, child 2",
				"nested level 2, item 3, child 3",
				"nested level 2, item 3, child 4"
			]
		}
	};

	return route;
});

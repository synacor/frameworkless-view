define([
	'util',
	'view', 
	'text!templates/index.html'
], function(util, view, template) {

	var route = {
		url : '/',
		
		events : {
			'click #submit' : function() {
				page.view.base.find('form').submit();
			},
			'click #reset' : function() {
				page.view.base.find('form').reset();
			}
		},
		
		load : function(params, router) {
			
			if (!this.view) {
				// initialize a view:
				this.view = view(template);
				
				// wire up event handlers:
				this.view.hookEvents(this.events);
			}
			
			this.view.template( dummyData );
			
			// insert view into DOM:
			this.view.insertInto('#main');
		},
		
		unload : function() {
			// remove view from DOM:
			this.view.base.remove();
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
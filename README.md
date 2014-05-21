Frameworkless Views
===================
Adds support for simple HTML views using Zepto and Handlebars.


---


Usage
-----

```JavaScript
require(['view'], function(view) {
	
	// We're using Handlebars templates:
	var template = '<h1>{{{title}}}</h1> <button id="hi">Click Me</button>';
	
	// Instantiate a view:
	var page = view( template );
	
	// Wire up some events:
	page.hookEvents({
		'click button#hi' : function() {
			alert( 'Title: ' + page.base.find('h1').text() );
		}
	});
	
	// Insert the view into the DOM:
	page.insertInto( document.body );
	
});
```


---


Integrated Example
------------------

```JavaScript
define([
	'util', 'view', 
	'text!templates/index.html'		// just an HTML file
], function(util, view, template) {
	var page = {
		url : '/',
		
		events : {
			'click #submit' : function() {
				page.view.base.find('form').submit();
			}
		},
		
		load : function(params, router) {
			if (!this.view) {
				// initialize a view:
				this.view = view(template);
				
				// wire up event handlers:
				this.view.hookEvents(this.events);
			}
			
			// Template some data into the view:
			this.view.template({
				title : 'Test Title',
				params : params
			});
			
			// insert view into DOM:
			this.view.insertInto('#main');
		},
		
		unload : function() {
			// remove view from DOM:
			this.view.base.remove();
		}
	};
	return page;
});
```
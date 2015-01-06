Frameworkless View [![NPM Version](http://img.shields.io/npm/v/frameworkless-view.svg?style=flat)](https://www.npmjs.org/package/frameworkless-view) [![Bower Version](http://img.shields.io/bower/v/frameworkless-view.svg?style=flat)](http://bower.io/search/?q=frameworkless-view)
=============
Adds support for simple HTML views using Zepto and Handlebars.

[![Build Status](https://img.shields.io/travis/synacorinc/frameworkless-view.svg?style=flat&branch=master)](https://travis-ci.org/synacorinc/frameworkless-view)
[![Dependency Status](http://img.shields.io/david/synacorinc/frameworkless-view.svg?style=flat)](https://david-dm.org/synacorinc/frameworkless-view)
[![devDependency Status](http://img.shields.io/david/dev/synacorinc/frameworkless-view.svg?style=flat)](https://david-dm.org/synacorinc/frameworkless-view#info=devDependencies)


Use a Package Manager
---------------------
**bower:**

```bash
bower install frameworkless-view
# copy the stuff you want
cp bower_components/frameworkless-view/dist/view.js src/lib
```

**npm:**

```bash
npm install frameworkless-view
# copy the stuff you want
cp node_modules/frameworkless-view/dist/view.js src/lib
```


---


Use the Source
--------------

Get started right away, so you can disassemble and play around at your lesure.

```bash
# Clone frameworkless-view
git clone git@github.com:synacorinc/frameworkless-view.git

# Install development dependencies
npm install

# Build the library
npm run-script build      # or just `grunt` if you have grunt-cli installed globally

# Check out the demo
PORT=8080 npm start       # this just does `node server.js`
```


---


Quick Repo Tour
---------------

* `/src` is where the source code lives
* `/dist` is the built library
* `/demo` is a simple demo, using [requirejs](http://requirejs.org)


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
			alert( 'Title: ' + page.$$('h1').textContent );
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
	'view',
	'text!templates/index.html'		// just an HTML file
], function(view, template) {
	var page = {
		events : {
			'click #submit' : 'submit',
			'mouseover .tip' : 'showTip'
		},

		submit : function() {
			this.view.$$('form').subimt();
		},

		showTip : function(e) {
			var tip = this.view.$$('#tip');
			tip.textContent = e.delegationTarget.getAttribute('title');
			tip.style.display = '';
		},

		load : function(params, router) {
			if (!this.view) {
				// initialize a view:
				this.view = view(template);

				// wire up event handlers:
				this.view.hookEvents(this.events, this);
			}

			// Template some data into the view:
			this.view.template({
				title : 'Test Title',
				params : params
			});

			// insert view into DOM:
			this.view.insertInto(document.body);
		},

		unload : function() {
			// remove view from DOM:
			this.view.remove();
		}
	};
	return page;
});
```


---


Concise Example
---------------

```JavaScript
var view = require('view');

var list = view({
	template : '<ul> {{#items}}<li>{{.}}</li>{{/items}} </ul>',

	events : {
		'click li' : 'clickItem'
	},

	clickItem : function(e) {
		console.log(e.delegationTarget.getAttribute('title'));
	}
};

// insert into a parent node:
list.insertInto(document.body);

// template some data:
list.render({
	items : [ 'Peach', 'Mango', 'Orange' ]
});
```

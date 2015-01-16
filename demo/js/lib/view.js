/**	Provides a Class and mixin that implement simple HTML views using Handlebars as a template engine.
 *	If called directly as a function, <code>view()</code> is an alias of {@link module:view.View View}.
 *	@module view
 *
 *	@example
 *		<caption>Basic Usage:</caption>
 *
 *		var view = require('view');
 *
 *		// Uses Handlebars templates:
 *		var template = '<h1>{{{title}}}</h1> <button id="hi">Click Me</button>';
 *
 *		// Instantiate a view:
 *		var page = view( template );
 *
 *		// Wire up some events:
 *		page.hookEvents({
 *			'click button#hi' : function() {
 *				alert( 'Title: ' + page.$$('h1').textContent );
 *			}
 *		});
 *
 *		// Insert the view into the DOM:
 *		page.insertInto( document.body );
 *
 *	@example
 *		<caption>Integrated Example:</caption>
 *
 *		define([
 *			'view',
 *			'text!templates/index.html'		// just an HTML file
 *		], function(view, template) {
 *			var page = {
 *				events : {
 *					'click #submit' : 'submit',
 *					'mouseover .tip' : 'showTip'
 *				},
 *
 *				submit : function() {
 *					this.view.$$('form').subimt();
 *				},
 *
 *				showTip : function(e) {
 *					var tip = this.view.$$('#tip');
 *					tip.textContent = e.delegationTarget.getAttribute('title');
 *					tip.style.display = '';
 *				},
 *
 *				load : function(params, router) {
 *					if (!this.view) {
 *						// initialize a view:
 *						this.view = view(template);
 *
 *						// wire up event handlers:
 *						this.view.hookEvents(this.events, this);
 *					}
 *
 *					// Template some data into the view:
 *					this.view.template({
 *						title : 'Test Title',
 *						params : params
 *					});
 *
 *					// insert view into DOM:
 *					this.view.insertInto(document.body);
 *				},
 *
 *				unload : function() {
 *					// remove view from DOM:
 *					this.view.remove();
 *				}
 *			};
 *			return page;
 *		});
 *
 *	@example
 *		<caption>Concise Example:</caption>
 *
 *		var view = require('view');
 *
 *		var list = view({
 *			template : '<ul> {{#items}}<li>{{.}}</li>{{/items}} </ul>',
 *
 *			events : {
 *				'click li' : 'clickItem'
 *			},
 *
 *			clickItem : function(e) {
 *				console.log(e.delegationTarget.getAttribute('title'));
 *			}
 *		};
 *
 *		// insert into a parent node:
 *		list.insertInto(document.body);
 *
 *		// template some data:
 *		list.render({
 *			items : [ 'Peach', 'Mango', 'Orange' ]
 *		});
 */
(function(g, factory) {
	if (typeof define==='function' && define.amd) {
		define(['util', 'events', 'handlebars'], factory);
	}
	else {
		g.view = factory(g.util, g.EventEmitter, g.handlebars);
	}
}(this, function(_, events, handlebars) {
	var EventEmitter = events.EventEmitter || events,
		proto = (window.Element || document.createElement('div').constructor).prototype,
		matches;


	/** Matches selector to passed-in DOM node (see handleDelegate)
	 *	@function
	 *	@ignore
	 */
	matches = proto.matches ||
		proto.webkitMatchesSelector ||
		proto.mozMatchesSelector ||
		proto.oMatchesSelector ||
		function(sel) {
			var els = document.querySelectorAll(sel);
			for (var i=els.length; i--; )
				if (els[i]===this)
					return true;
			return false;
		};

	/** Event delegation implementation: Initial set-up for hooking event
	*	@param {Element} node - The root DOM node for delegating the event to
	*	@param {string} type - Type of event
	*	@param {string} selector - CSS Selector for DOM node
	*	@param {string} callback - Event handler (callback function)
	*	@private
	*	@returns {boolean} handlerWasAdded
	*/
	function delegateFrom(node, type, selector, callback) {
		if (!node || !type || !selector || !callback) return false;

		if (!node._eventRegistry) node._eventRegistry = [];

		if (!node._eventTypes) node._eventTypes = {};

		if (!node._eventTypes.hasOwnProperty(type)) {
			node.addEventListener(type, handleDelegate);
			node._eventTypes[type] = true;
		}

		node._eventRegistry.push({
			type: type,
			selector: selector,
			callback: callback
		});
		return true;
	}

	/** Event delegation implementation: Delegation handler
	*	@param {Object} event - Event to delegate
	*/
	function handleDelegate(event) {
		var self = this,
			reg = this._eventRegistry,
			parent = event.target || event.srcElement,
			handlers = [],
			handler, i;

		for (i=reg.length; i--; ) {
			if (reg[i].type===event.type) {
				handlers.push(reg[i]);
			}
		}

		do {
			for (i=handlers.length; i--; ) {
				handler = handlers[i];
				if (matches.call(parent, handler.selector)) {
					event.currentTarget = event.delegationTarget = parent;
					if (handler.callback.call(parent, event)===false) {
						return false;
					}
				}
			}
		} while( (parent=parent.parentNode)!==this.parentNode );
	}

	/**	The View class.
	 *	@memberOf module:view
	 *	@constructor
	 *	@param {string} tpl - Template to inject
	 *	@param {string} name - Name of template
	 */
	function View(tpl, name) {
		if (!(this instanceof View)) return new View(tpl, name);

		this.base = document.createElement('div');

		if (typeof tpl==='object') {
			_.extend(this, tpl);
			if (tpl.events) {
				this.hookEvents(this.events, this);
			}
			name = tpl.name;
			tpl = tpl.template || tpl.tpl;
		}

		this.rawView = tpl;
		this.renderTemplate = handlebars.compile(this.rawView);

		if (name) {
			this.base.setAttribute('id', name + '-base');
		}
		this.base.className = 'view-base';
		this.base.innerHTML = this.rawView;

		this.name = name;
		if (this.name) {
			this.base.setAttribute('data-view', name);
		}
	}

	_.inherits(View, EventEmitter);

	_.extend(View.prototype, /** @lends module:view.View# */ {

		/** Render the view using the given data.
		 *	@param {Object} data	Template data fields to inject.
		 */
		render : function(data) {
			if (!this.renderTemplate || !this.base) return false;
			this.templateData = data;
			this.base.innerHTML = (data && this.renderTemplate(data)) || this.rawView;
			return this;
		},

		/** Alias of {@link View#render view.render()} */
		template : function(data) {
			return View.prototype.render.call(this, data);
		},

		/** Register a hash of selector-delegated event handler functions.
		 *	@param {Object} events	Events to register. Keys are of the form `event-type some#css.selector`.
		 */
		hookEvents : function(events, ctx) {
			var sep, evt, fn, selector, c, x;
			if (!this.base) return false;
			this.events = events;
			for (x in events) {
				if (events.hasOwnProperty(x)) {
					sep = x.split(' ');
					evt = sep[0];
					selector = sep.slice(1).join(' ');
					fn = events[x];
					if (ctx && typeof fn==='string') {
						fn = ctx[fn].bind(ctx);
					}
					if (!delegateFrom(this.base, evt, selector, fn)) {
						throw new Error('Invalid event entry "'+x+'".');
					}
				}
			}
			return this;
		},

		/**	Insert the view into a given parent node.
		 *	@param {String|Element} parent	A DOM element, or a CSS selector representing one.
		 */
		insertInto : function(parent) {
			if (typeof parent==='string') {
				parent = document.querySelector(parent);
			}
			parent.appendChild(this.base);
			return this;
		},

		/**	Insert the view immediately after a given sibling node.
		 *	@param {String|Element} selector	A DOM element, or a CSS selector representing one.
		 */
		insertAfter : function(sibling) {
			if (typeof sibling==='string') {
				sibling = document.querySelector(sibling);
			}
			sibling.parentNode.insertBefore(this.base, sibling.nextSibling);
			return this;
		},

		remove : function() {
			if (this.base && this.base.parentNode) {
				this.base.parentNode.removeChild(this.base);
			}
			return this;
		},

		/** Get an Array of nodes contained in the view that match the given selector.
		 *  @param {string} selector	A CSS selector
		 *  @returns {array} matchedNodes
		 */
		find : function(selector) {
			return Array.prototype.slice.call(this.base.querySelectorAll(selector));
		},

		/** Return the first node contained in the view that matches the given selector.
		 *  @param {string} selector	A CSS selector
		 *  @returns {Element} node
		 */
		findOne : function(selector) {
			return this.base.querySelector(selector);
		},

		/** Convenient alias of {@link View#find view.find()} */
		$ : function(selector) {
			return this.find(selector);
		},

		/** Convenient alias of {@link View#findOne view.findOne()} */
		$$ : function(selector) {
			return this.findOne(selector);
		}

	});

	/**	If the module is called as a function, returns a new {@link module:view.View View} instance.
	 *	@name module:view.view
	 *	@function
	 */
	View.View = View.view = View;

	return View;
}));

/**	Provides a Class and mixin that implement simple HTML views using Zepto and Handlebars.  
 *	If called directly as a function, <code>view()</code> is an alias of {@link view.mixin}.
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
 *				alert( 'Title: ' + page.base.find('h1').text() );
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
 *			'util', 'view', 
 *			'text!templates/index.html'		// just an HTML file
 *		], function(util, view, template) {
 *			var page = {
 *				url : '/',
 *				
 *				events : {
 *					'click #submit' : function() {
 *						page.view.base.find('form').submit();
 *					}
 *				},
 *				
 *				load : function(params, router) {
 *					if (!this.view) {
 *						// initialize a view:
 *						this.view = view(template);
 *						
 *						// wire up event handlers:
 *						this.view.hookEvents(this.events);
 *					}
 *					
 *					// Template some data into the view:
 *					this.view.template({
 *						title : 'Test Title',
 *						params : params
 *					});
 *					
 *					// insert view into DOM:
 *					this.view.insertInto('#main');
 *				},
 *				
 *				unload : function() {
 *					// remove view from DOM:
 *					this.view.base.remove();
 *				}
 *			};
 *			return page;
 *		});
 */
(function(factory) {
	if (typeof define==='function' && define.amd) {
		define(['util', 'events', 'handlebars'], factory);
	}
	else {
		factory(window.util, window.EventEmitter, $, handlebars);
	}
}(function(_, events, handlebars) {
	var EventEmitter = events.EventEmitter || events,
		proto = (window.Element || document.createElement('div').constructor).prototype,
		matches;

	_ = _ || $;


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
	*	@param {string} callback - Callback function of events object
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
				if (matches.call(parent, handler.selector) && handler.callback.call(parent, event)===false) {
					return false;
				}
			}
		} while( (parent=parent.parentNode)!==this.parentNode );
	}
	
	/**	The View class.
	 *	@constructor
	 *	@param {string} tpl - Template to inject
	 *	@param {string} name - Name of template
	 */
	function View(tpl, name) {
		if (!(this instanceof View)) return new View(tpl, name);

		this.rawView = tpl;
		this.renderTemplate = handlebars.compile(this.rawView);

		this.base = document.createElement('div');
		if(name) {
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
		 *	@param {Object} data - Template fields to inject.
		 */
		template : function(data) {
			if (!this.renderTemplate) return false;
			this.templateData = data;
			this.base.innerHTML = (data && this.renderTemplate(data)) || this.rawView;
			return this;
		},

		/** Register a hash of selector-delegated event handler functions.
		 *	@param {Object} events - Events to register. Keys are of the form `event-type some#css.selector`.
		 */
		hookEvents : function(events) {
			var sep, evt, selector, c, x;
			if (!this.base) return false;
			this.events = events;
			for (x in events) {
				if (events.hasOwnProperty(x)) {
					sep = x.split(' ');
					evt = sep[0];
					selector = sep.slice(1).join(' ');
					if (!delegateFrom(this.base, evt, selector, events[x])) {
						throw new Error('Invalid event entry "'+x+'".');
					}
				}
			}
			return this;
		},
		
		/**	Insert the view into a given parent node.
		 *	@param {String|Element} parent - A DOM element, or a CSS selector representing one.
		 */
		insertInto : function(parent) {
			if (!this.base) {
				throw new Error('Cannot insert view prior to initialization');
			}
			if(typeof parent==='string') {
				parent = document.querySelector(parent);
			}
			parent.appendChild(this.base);
			return this;
		},
		
		/**	Insert the view immediately after a given sibling node.
		 *	@param {String|Element} selector - A DOM element, or a CSS selector representing one.
		 */
		insertAfter : function(sibling) {
			if (this.base) {
				if(typeof sibling==='string') {
					sibling = document.querySelector(sibling);
				}
				sibling.parentNode.insertBefore(this.base, sibling.nextSibling);
			}
			return this;
		},
		
		/** Get an Array of nodes contained in the view that match the given selector.
		 *  @param {string} selector
		 *  @returns {array} matchedNodes
		 */
		find : function(selector) {
			return Array.prototype.slice.call(this.base.querySelectorAll(selector));
		},
		
		/** Return the first node contained in the view that matches the given selector.
		 *  @param {string} selector
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
	
	/**	If the module is called as a function, returns a new {@link view.View} instance.
	 *	@name view.view
	 *	@function view.view
	 */
	View.View = View.view = View;
	
	return View;
}));

define([
	'util', 'router', 'events',
	'./routes/index',
], function(util, router, events) {
	var routes = router();
	events.mixin(routes);
	
	// Automatically add any routes
	for (var i=3; i<arguments.length; i++) {
		routes.get(arguments[i].url, arguments[i]);
	}
	
	routes.init = function(path) {
		var base = document.getElementsByTagName('base')[0];
		if (base && base.href) {
			routes.setBaseUrl(base.getAttribute('href'));
		}
		
		document.body.addEventListener('createTouch' in document ? 'touchstart' : 'click', linkHandler);
		routes.route(path || location.pathname || location.hash || '/', true, false);
	};
	
	// Automatically route to pages
	function linkHandler(e) {
		var t=e.target, href;
		do {
			href = t.nodeName==='A' && t.getAttribute('href');
			if (href && href.match(/^\/#/g)) {
				routes.route(href.replace(/^\/#\/*/g,'/'));
				e.preventDefault();
				return false;
			}
		} while (t=t.parentNode);
	}
	
	return routes;
});
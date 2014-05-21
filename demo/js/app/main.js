define(['util', 'events', 'app/routes'], function(util, events, routes) {
	var app = events();
	
	app.on('init', routes.init);
	
	routes.on('route', function(e) {
		console.log('routed to '+e.url+' ('+e.rawUrl+')');
	});
	
	return app.emit('init');
});
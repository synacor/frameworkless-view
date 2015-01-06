var express = require('express'),
	compress = require('compression'),
	serveStatic = require('serve-static'),
	app = express(),
	port = process.env.PORT || 8080;

app.use(compress());

// rewrite
app.use(function(req, res, next) {
	if (!req.url.match(/(^\/?(static|demo|docs|dist|tests)\/|\.[a-z]+$)(\?.*)?/g)) {
		req.url = '/';
	}
	next();
});

app.use(serveStatic('docs'));

app.use('/demo', serveStatic('demo'));

app.use('/dist', serveStatic('dist'));

app.listen(port, function() {
	console.log('Server listening on localhost:'+port);
});

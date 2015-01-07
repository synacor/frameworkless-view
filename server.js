var express = require('express'),
	compression = require('compression'),
	serveStatic = require('serve-static'),
	app = express(),
	port = process.env.PORT || 8080;

app.use(compression());

app.use(function(req, res, next) {
	if (req.url.match(/^\/?demo(\/|$)/g) && !req.url.match(/\.[a-z]+(\?.*)?$/g)) {
		req.url = '/demo/';
	}
	next();
});

app.use(serveStatic('docs/'));
app.use('/dist', serveStatic('dist/'));
app.use('/demo', serveStatic('demo/'));

app.listen(port, function() {
	console.log('Server listening on localhost:'+port);
});

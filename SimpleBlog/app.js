
/**
 * Module dependencies.
 */

 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoStore = require('session-mongoose')
  , flash = require('connect-flash');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(flash());

  var mongooseSessionStore = new mongoStore({
      url: "mongodb://localhost/test",
      interval: 12000000 
  });

  app.use(express.session( {cookie: {maxAge: 12000000}, store: mongooseSessionStore, secret: "crazysecretstuff" }));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req,res,next){res.render('error/404.jade', {title: "404 - Page Not Found", status: 404, url: req.url})});
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

// Database
var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://127.0.0.1/test');

require('./routes/blog')(app, db, '/blog'); //starts the blog up



//var blogpages = require('./routes/BlogPages');
//var bp = new blogpages();
//bp.initPages(app, db, '/blog');



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

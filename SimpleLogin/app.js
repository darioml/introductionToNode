
/**
 * Module dependencies.
 */

 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "crazysecretstuff"}));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req,res,next){res.render('error/404.jade', {title: "404 - Page Not Found", showFullNav: false, status: 404, url: req.url})});
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/', routes.index);
//app.get('/users', user.list);


// Database
var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://127.0.0.1/test');

var admin_pages = require('./lib/AdminPages');
var ap = new admin_pages();
ap.initPages(app, db);



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

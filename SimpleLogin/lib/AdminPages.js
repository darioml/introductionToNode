 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose
var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

var AdminPages = module.exports = function AdminPages(){};

AdminPages.prototype = {

	  db: null

	, initPages: function(app, db){

		this.db = db;
		var self = this;

		app.get ('/Admin/Login', function(req, res) { self.pageLogin(req, res); } );
		app.post('/Admin/Login', function(req, res) { self.pageLoginPost(req, res); }  );
		app.get ('/Admin/Logout', function(req, res) { self.pageLogout(req, res); }  );

		app.get ('/Admin', function(req, res) { self.pageIndex(req, res); } );

		app.get('/Admin/*', function(req, res) {
			res.redirect('/Admin');
		})
	}

	, _checkLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
			return true;

		res.redirect('/Admin/Login');
		return false;
	}

	, pageLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
		{
			res.redirect('/Admin');
		}
		res.render('admin/login', {
			title: 'Login',
			showFullNav: false
		});
	} 

	, pageLoginPost: function(req, res){
		if(req.body && req.body.password && req.body.email){
			var adminuser = this.db.model('adminUser');
			adminuser.findOne(
				  {	  login: 		req.body.email 
					, password: 	hashString(req.body.password) }
				, function(err, row){

				if(err){
					res.render('admin/login', {
						title: 'Login',
						showFullNav: false,
						error_text: err
					});			
				}else{
					if(row){
						req.session.loggedIn = true; // register user is logged in
						res.redirect('/Admin')
					}else{
						res.render('admin/login', {
							title: 'Login',
							showFullNav: false,
							error_text: 'User not found, Please try again',
							email: req.body.email
						});	
					}
				}
			});
		}else{
			res.render('admin/login', {
				title: 'Login',
				showFullNav: false,
				error_text: 'Error processing login.'
			});	
		}
	}

	, pageIndex: function(req, res){
		if( !this._checkLogin(req, res) ) return;

		res.render('admin/index', {
			title: 'Admin Index',
			showFullNav: false
		});
	}

	, pageLogout: function(req, res){
		delete req.session.loggedIn;
		res.redirect('/Admin/Login');
	}

};
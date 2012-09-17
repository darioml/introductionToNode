 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose
var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}
/*var post = db.model('blogpost');
			var newpost = new post({
				bid		: { type: Number, required: true, unique: true, index: true },
				author	: { type: String },
				title	: { type: String },
				content	: { type: String },
				posted	: { type: Date, index: true, default: Date.now }
			});
			usr.save(function(err){
				console.log("User added to database");
				process.exit(0); // Success
			});*/
var AdminPages = module.exports = function AdminPages(){};

AdminPages.prototype = {

	  db: null

	, initPages: function(app, db){

		this.db = db;
		var self = this;

		app.get ('/admin/login', function(req, res) { self.pageLogin(req, res); } );
		app.post('/admin/login', function(req, res) { self.pageLoginPost(req, res); }  );
		app.get ('/admin/logout', function(req, res) { self.pageLogout(req, res); }  );

		app.get ('/admin', function(req, res) { self.pageIndex(req, res); } );
		app.get ('/admin/posts/:id', function(req, res) { self.pageblogPosts(req, res); }  );
		app.get ('/admin/posts', function(req, res) { self.pageblogPosts(req, res); }  );
		app.post ('/admin/posts/:id', function(req, res) { self.pagemakenewPost(req, res); }  );
		app.post ('/admin/posts', function(req, res) { self.pagemakenewPost(req, res); }  );

		app.get('/admin/*', function(req, res) {
			res.redirect('/admin');
		})
	}

	, _checkLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
			return true;

		res.redirect('/admin/login');
		return false;
	}

	, pageLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
		{
			res.redirect('/admin');
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
						res.redirect('/admin')
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

		var blogposts = this.db.model('blogpost');

		blogposts.find().sort('-posted').exec(function(err, rows){
			if (err) { console.log(err); }

			res.render('admin/index', {
				title: 'Admin Index',
				posts: rows,
				showFullNav: false
			});

		})

		
	}

	, pageblogPosts: function(req, res){
		if( !this._checkLogin(req, res) ) return;
		var blogposts = this.db.model('blogpost');

		blogposts.findOne({bid: req.params.id}, function(err, row){

			if (err)
			{
				console.log(err);
			}
			else if (row != null){
			}

			res.render('admin/newpost', {
				title: (row == null) ? "<i>New Post</i>" : "<i>Edit Post</i>",
				btitle: (row != null) ? row.title : null,
				bcontent: (row != null) ? row.content : null,
				showFullNav: false
			});

		});
	}

	, pagemakenewPost: function(req, res){
		if( !this._checkLogin(req, res) ) return;

		
		if (req.body.title && req.body.content){
			var blogposts = this.db.model('blogpost');

			if (req.params.id)
			{
				blogposts.findOne({bid: req.params.id}, function(err, row){
					if (err)
					{
						console.log(err);
					}
					else if (row == null)
					{
						res.redirect('/admin/posts/' + req.params.id);
					}
					else
					{
						//let's edit.
						blogposts.update(
							{bid: req.params.id},
							{title: req.body.title
							,content: req.body.content},
							{multi: false},
							function(err, numrows){
								if(err){
									console.log(err);
								}else{
									console.log("Updated ("+numrows+") blog post(s) at internal id: " + req.body.id);
								}
								res.redirect('/admin/posts/' + req.params.id);
							});
					}
				});

			}
			else
			{
				blogposts.find().sort("-bid").limit(1).exec(function(err,result){
					if (err)
						console.log(err);

					if (!result || result.length == 0)
					{
						var newid = 1;
					}
					else
					{
						var newid = result[0].bid + 1;
					}
					console.log("I would add " + newid);

					var newpost = new blogposts({
						bid		: newid,
						author	: 'Dario',
						title	: req.body.title,
						content	: req.body.content
					});
					newpost.save(function(err){
						console.log("User added to database");
					});

					res.redirect('/admin');

				});
			}
		}
		else
			res.send("there was an error");
	}

	, pageLogout: function(req, res){
		delete req.session.loggedIn;
		res.redirect('/admin/login');
	}

};
var db = null;
var basedir = null;

module.exports = function(app, _db, _basedir){
	db = _db;
	basedir = _basedir;

	app.get (basedir, pages.home );
	app.get (basedir + '/show/:id', pages.getBlog );

	app.get (basedir + '/login', pages.adminlogin );
	app.get (basedir + '/*/login', pages.adminlogin );
	app.post(basedir + '/login', pages.adminloginpost );
	app.post(basedir + '/*/login', pages.adminloginpost );
	app.get (basedir + '/logout', pages.adminlogout);
	app.get (basedir + '/*/logout', pages.adminlogout);

	app.get (basedir + '/admin', pages.adminhome);
	app.get (basedir + '/admin/posts/:id', pages.pageblogPosts);
	app.get (basedir + '/admin/posts', pages.pageblogPosts);
	app.post (basedir + '/admin/posts/:id', pages.pagemakenewPost);
	app.post (basedir + '/admin/posts', pages.pagemakenewPost);
  
};

var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

var pages = {

	  home:	function(req, res)	{
		var blogposts = db.model('blogpost');

		blogposts.find().sort('-posted').exec(function(err, rows){
			if (err) { console.log(err); }
			
			res.render('blog/index', {
				title: 'Admin Index',
				posts: rows,
				showFullNav: false
			});
		})
	}

	, getBlog: function(req,res)  {
		if (req.params.id) {
			var blogposts = db.model('blogpost');

			blogposts.findOne({bid: req.params.id}, function(err, row){
				if (err) { console.log(err); }

				if (row != null){
					res.render('blog/show', {
						title: 'Show Blog',
						btitle: row.title,
						bcontent: row.content
					});
				}
				else
				{
					res.redirect(basedir);
				}

			});
		}
	}

	, _checkLogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
			return true;

		res.redirect(basedir + '/admin/login');
		return false;
	}

	, adminlogin: function(req, res){
		if(req.session && req.session.loggedIn === true)
		{
			res.redirect(basedir + '/admin');
		}

		res.render('admin/login', {
			title: 'Login',
			email: req.flash('username'),
			error_text: req.flash('loginError'),
			showFullNav: false
		});
	} 

	, adminloginpost: function(req, res){
		req.flash('username');
		req.flash('username', (req.body.email) ? req.body.email : null);
		if (req.body.type == "ajax")
		{
			var adminuser = db.model('adminUser');
			adminuser.findOne(
				  {	  login: 		req.body.email 
					, password: 	hashString(req.body.password) }
				, function(err, row){

				if(err){
					console.log(err);
					res.end(JSON.stringify({ 'accepted':false, 'error': "Unexpected Error" }));
				}
				else {
					if(row){
						req.session.loggedIn = true; // register user is logged in
						res.end(JSON.stringify({ 'accepted':true
							, 'redirect' : basedir + '/admin/login'}));
					}
					else{
						res.end(JSON.stringify({ 'accepted':false, 'error': "User not found - try again?" }));
					}
				}
			});
		}
		else if(req.body && req.body.password && req.body.email){
			var adminuser = db.model('adminUser');
			adminuser.findOne(
				  {	  login: 		req.body.email 
					, password: 	hashString(req.body.password) }
				, function(err, row){

				if(err){
					req.flash('loginError', err);
					res.redirect(basedir + '/admin/login');		
				}
				else {
					if(row){
						req.session.loggedIn = true; // register user is logged in
						res.redirect(basedir + '/admin')
					}
					else{
						req.flash('loginError', 'User not found - try again?');
						res.redirect(basedir + '/admin/login');
					}
				}
			});
		}else{
			req.flash('loginError', 'Provide login details');
			res.redirect(basedir + '/admin/login');
		}
	}

	, adminhome: function(req, res){
		if( !pages._checkLogin(req, res) ) return;

		var blogposts = db.model('blogpost');

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
		var blogposts = db.model('blogpost');

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
			var blogposts = db.model('blogpost');

			if (req.params.id)
			{
				blogposts.findOne({bid: req.params.id}, function(err, row){
					if (err)
					{
						console.log(err);
					}
					else if (row == null)
					{
						res.redirect(basedir + '/admin/posts/' + req.params.id);
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
								res.redirect(basedir + '/admin/posts/' + req.params.id);
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

					res.redirect(basedir + '/admin');

				});
			}
		}
		else
			res.send("there was an error");
	}

	, adminlogout: function(req, res){
		req.flash('username');
		delete req.session.loggedIn;
		res.redirect(basedir + '/admin/login');
	}

}
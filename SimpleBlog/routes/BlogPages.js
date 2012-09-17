

var BlogPages = module.exports = function BlogPages(){};

BlogPages.prototype = {

	  db: null

	, basedir: null

	, initPages: function(app, db, basedir){

		this.db = db;
		this.basedir = basedir;
		var self = this;

		app.get (basedir, function(req, res) { self.pageIndex(req, res); } );
		app.get (basedir + '/show/:id', function(req, res) { self.getBlog(req, res); } );	


		app.get(basedir + '/*', function(req, res) {
			res.redirect(basedir);
		})
	}

	, pageIndex: function(req, res){

		var blogposts = this.db.model('blogpost');

		blogposts.find().sort('-posted').exec(function(err, rows){
			if (err) { console.log(err); }

			res.render('blog/index', {
				title: 'Admin Index',
				posts: rows,
				showFullNav: false
			});

		})

	}

	, getBlog: function(req,res){
		if (req.params.id) {
			var blogposts = this.db.model('blogpost');
			var basedir = this.basedir;

			blogposts.findOne({bid: req.params.id}, function(err, row){
				if (err) { console.log("I fucked up here"); console.log(err); }

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

};
 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose

var mongoose = require('mongoose');

var Database = module.exports = function Database(){};

Database.prototype = {

	  _collections: {
	  	adminUser: {
			  login		: String
			, password	: String
		},

		blogPost:{
			bid		: { type: Number, required: true, unique: true, index: true },
			author	: { type: String },
			title	: { type: String },
			content	: { type: String },
			posted	: { type: Date, index: true, default: Date.now }
		}
	}

	, _db: null
	, _schema: {}
	, _model: {}

	, connect: function(url){
		this._db = mongoose.createConnection(url);

		this._schema.adminUser = new mongoose.Schema(this._collections.adminUser);
		this._model.adminUser = this._db.model('adminUser', this._schema.adminUser);
		
		this._schema.blogPost = new mongoose.Schema(this._collections.blogPost);
		this._model.blogPost = this._db.model('blogPost', this._schema.blogPost);

	}

	, model: function(mod){	
		switch (mod){
			case 'adminUser':
				return this._model.adminUser;
			case 'blogpost' :
				return this._model.blogPost;
		}
	}

};
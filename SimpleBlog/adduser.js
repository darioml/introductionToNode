/**********************
A simple script to add a new user
**********************/
// Includes
 // Slightly modified: http://mikevalstar.com/Blog/#!/Blog/106/Coding_with_Nodejs_Part_3_Admin_login_with_Mongo_&_Mongoose

/*
var mongoose = require('mongoose');
var db = mongoose.createConnection('localhost', 'test');

var schema = mongoose.Schema({ name: 'string', password: 'string' });
var Cat = db.model('darioawesome', schema, 'mycollection');

var kitty = new Cat({ name: 'Zildjian', password: 'yomomma' });
kitty.save(function (err) {
  if (err) {throw err;}
  console.log("Saved");
});

Cat.find(function (err, kittens) {
  if (err) {throw err;}
  console.log(kittens)
});
*/

/*
// Database
//var Database = require('./lib/Database');
var db = mongoose.createConnection('mongodb://127.0.0.1/test');

db.on('error', function(){
	console.log("connection error");
});

		
	var adminUserSchema = new mongoose.Schema({
	    login: String,
	    password: String
	});
	var aU = db.model('adminUsers', adminUserSchema, 'admin_users');

	var user = new aU({login: "dario", password: "test"});

	user.save(function(err){
		if (err) { console.log("oh no error"); }
		process.exit(0);
	});
*/

var crypto = require('crypto');

function hashString(value) {
  hash = crypto.createHash('sha1');
  hash.update(value);
  return hash.digest('hex');
}

// Database
var Database = require('./lib/Database');
var db = new Database();
db.connect('mongodb://localhost/test');

if(process.argv.length == 4){
	// 0 will be node, 1 will be the script

	var au = db.model('adminUser');
	var usr = new au({login: process.argv[2], password: hashString(process.argv[3]) });
	usr.save(function(err){
		console.log("User added to database");
		process.exit(0); // Success
	});

}else{
	console.error("Script requires exactly 2 arguments");
	console.error("Usage: node addUser.js <email> <password>");
	process.exit(1); // Failure
}
'use strict';
var exec = require('child_process').exec,
	path = require('path'),
	clone = require('clone-component');


//add lib folder to require path; add node_modules bin programs to shell path
var env = clone(process.env);
env.NODE_PATH = 'lib';
env.PATH = path.resolve('node_modules/.bin') + path.delimiter + env.PATH;


module.exports = function(grunt) {
	grunt.registerTask('migrate', 'Run migrations', function() {
		var next = this.async();

		var cmd = 'migrate ' + this.args.join(' ');
		console.log(cmd);
		var cp = exec(cmd, {env: env}, function (err) {
			next(err);
		});
		cp.stdout.pipe(process.stdout);
		cp.stderr.pipe(process.stderr);
		process.stdin.pipe(cp.stdin);
	});
};

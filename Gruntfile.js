'use strict';
var path = require('path'),
	clone = require('clone-component');


exports = module.exports = function(grunt) {
	//add lib folder to require path; add node_modules bin programs to shell path
	var env = clone(process.env);
	env.NODE_PATH = 'lib';
	env.PATH = path.resolve('node_modules/.bin') + path.delimiter + env.PATH;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		debugPort: 50010,

		shell: {
			options: { stdout: true, stderr: true, execOptions: { env: env }},
			componentInstall: {command: 'component install --dev'},
			componentBuild: {command: 'component build --out ./lib/webUI/public/build'},
			componentBuildTest: {command: 'component build --out ./test/build'},
			jshint: {command: 'jshint *.js **/*.js'},
			mocha: {command: 'mocha --harmony-generators --reporter spec --timeout 15s'},
			server: {command: 'node --harmony-generators server.js'},
			testServer: {command: 'http-server test'}
		},

		clean: ['components', 'lib/webUI/public/build', 'test/build'],

		watch: {
			options: { spawn: false, interval: 500 },
			components: {
				files: ['lib/webUI/components/**/*', 'test/components/**/*'],
				tasks: ['shell:componentBuild', 'shell:componentBuildTest']
			}
		}
	});

	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['server']);
	grunt.registerTask('install', ['shell:componentInstall']);
	grunt.registerTask('build', ['shell:componentBuild', 'shell:componentBuildTest']);
	grunt.registerTask('test', ['shell:jshint', 'shell:mocha']);
	grunt.registerTask('server', ['shell:server']);
	grunt.registerTask('testServer', ['shell:testServer']);
};

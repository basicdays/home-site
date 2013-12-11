'use strict';

var path = require('path');
var clone = require('clone-component');

exports = module.exports = function(grunt) {
	var env = clone(process.env);
	env.NODE_PATH = 'lib';
	env.PATH = path.resolve('node_modules/.bin') + path.delimiter + env.PATH;

	var shellOptions = {
		stdout: true,
		stderr: true,
		execOptions: {
			env: env
		}
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		debugPort: 50010,

		shell: {
			componentInstall: {command: 'component install --dev', options: shellOptions},
			componentBuild: {command: 'component build --out ./lib/webUI/public/build', options: shellOptions},
			componentBuildDev: {command: 'component build --dev --out ./test/build', options: shellOptions},
			jshint: {command: 'jshint *.js **/*.js', options: shellOptions},
			mocha: {command: 'mocha --harmony-generators --reporter spec --timeout 15s', options: shellOptions},
			server: {command: 'node --harmony-generators server.js', options: shellOptions},
			testServer: {command: 'http-server test', options: shellOptions}
		},

		clean: ['components', 'lib/webUI/public/build', 'test/build']
	});

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['server']);
	grunt.registerTask('install', ['shell:componentInstall']);
	grunt.registerTask('build', ['shell:componentBuild', 'shell:componentBuildDev']);
	grunt.registerTask('test', ['shell:jshint', 'shell:mocha']);
	grunt.registerTask('server', ['shell:server']);
	grunt.registerTask('testServer', ['shell:testServer']);
};

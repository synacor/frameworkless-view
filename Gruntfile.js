module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			main : {
				files: {
					'dist/min/view.min.js': ['dist/view.js']
				}
			}
		},

		copy : {
			main : {
				expand : true,
				cwd : 'src/',
				src : '**',
				dest : 'dist/'
			},

			demo : {
				expand : true,
				cwd : 'src/',
				src : '**',
				dest : 'demo/js/lib/'
			}
		},

		jshint : {
			options : {
				browser : true
			},
			main : [
				'src/**/*.js',
				'!src/test/**/*.js',
				'!src/demo/**/*.js'
			]
		},

		jsdoc : {
			main : {
				src: [
					'src/*.js',
					'README.md'
				],
				jsdoc : './node_modules/.bin/jsdoc',
				dest : 'docs',
				options : {
					configure : 'jsdoc.json'
				}
			}
		},

		watch : {
			options : {
				interrupt : true
			},
			src : {
				files : [
					'src/**/*.js',
					'Gruntfile.js',
					'README.md',
					'jsdoc-template/**/*'
				],
				tasks : ['default']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'jshint:main',
		'copy:main',
		'uglify:main',
		'copy:demo',
		'jsdoc:main'
	]);

	grunt.registerTask('build-watch', [
		'default',
		'watch'
	]);

};

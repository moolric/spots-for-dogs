
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg  : grunt.file.readJSON('package.json'),
        sass : {
            prod: {
                options: {
                    style: 'compressed'
                },
                files  : {
                    "www/css/app.min.css": "sass/app.scss"
                }
            }
        },
        watch: {
            styles: {
                files: ['sass/**/*.scss'],
                tasks: ['sass:prod'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['!www/js/scripts.js', 'www/js/app.js','www/js/*/*.*.js'],
                tasks: ['ngAnnotate'],
                options: {
                    livereload: true
                }
            },
            html : {
                files: ['www/**/*.html'],
                options: {
                    livereload: true
                }
            }

        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    'www/scripts.js': ['www/js/app.js','www/js/*/*.*.js' ]
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['watch']);
};


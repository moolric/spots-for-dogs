
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
                    "html/css/app.min.css": "sass/app.scss"
                }
            }
        },
        watch: {
            styles: {
                files: ['sass/**/*.scss'],
                tasks: ['sass:prod'],
                options: {
                    livereload: true,
                }
            },
            js: {
                files: ['!html/js/scripts.js', 'html/js/app.js','html/js/*/*.*.js'],
                tasks: ['ngAnnotate'],
                options: {
                    livereload: true,
                }
            }

        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    'html/js/scripts.js': ['html/js/app.js','html/js/*/*.*.js' ]
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['watch']);
};


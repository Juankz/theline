module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {                                   // Dictionary of files
                    'dist/index.html': 'index.html',     // 'destination': 'source'
            }
        }
    },
    uglify: {
        options: {
            nameCache: '.tmp/grunt-uglify-cache.json',
        },
        dist: {
            files: {
                'dist/systems.js': ['systems.js'],
                'dist/components.js': ['components.js']
            }
        }
    },
    imagemin: {
        dist:{
            files: [{
                'dist/tile.png': 'tile.png',
                'dist/tile2.png': 'tile2.png',
                'dist/tile3.png': 'tile3.png',
            }]
        }
    },
    compress: {
        dist: {
            options: {
                archive: 'balance.zip'
            },
            files: [
                {src: ['dist/**'], dest: '/'}
            ]
        }
    }
    });

    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', ['htmlmin','uglify','imagemin','compress']);
}
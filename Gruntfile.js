module.exports = function(grunt) {

  function createBanner() {
    return '/**\n' +
      ' * @copyright 2006-2013, Miles Johnson - http://milesj.me\n' +
      ' * @license   http://opensource.org/licenses/mit-license.php\n' +
      ' * @link      http://milesj.me/code/javascript/joop\n' +
      ' */\n';
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        globals: {
          console: true
        },
        browser: true,
        // enforcing
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        noempty: true,
        quotmark: 'single',
        undef: true,
        unused: 'vars',
        strict: true,
        trailing: true,
        // relaxing
        boss: true,
        scripturl: true
      },
      build: {
        src: ['src/**/*.js']
      }
    },

    uglify: {
      options: {
        report: 'min',
        banner: createBanner()
      },
      build: {
        files: {
          'lib/class.js': 'src/class.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint', 'uglify']);
};
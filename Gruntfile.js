// Set CHROME_BIN to Puppeteer's Chromium for headless testing in CI/Codespaces
typeof process.env.CHROME_BIN === 'undefined' && (() => {
  try {
    process.env.CHROME_BIN = require('puppeteer').executablePath();
  } catch (e) {
    // Puppeteer not installed or error, fallback to system Chrome
  }
})();

module.exports = function (grunt) {

  require("load-grunt-tasks")(grunt) //loads all Grunt NpmTasks automatically

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /* ESLint */
    // lint our JS
    eslint: {
      options: {
        overrideConfigFile: ".eslintrc.flat.js",
        maxWarnings: 20
      },
      target: ['Gruntfile.js', 'src/js/*.js', 'test/*.js']
    },

    /* Babel */
    // transpile our JS (which uses new ES6 syntax) down to older, more browser compatible JS syntax
    babel: {
      options: {
        presets: ['env'] //compiles to JS compatible with most browsers (using browserslist default setting)
      },
      dist: {
        files: {
          'dist/JCHS-highcharts.js': 'src/js/JCHS-highcharts.js',
          'dist/JCHS-highcharts--map.js': 'src/js/JCHS-highcharts--map.js'
        }
      }
    },

    /* Uglify */
    //minify the final JS file
    uglify: {
      my_target: {
        files: {
          'dist/JCHS-highcharts.min.js': ['dist/JCHS-highcharts.js'],
          'dist/JCHS-highcharts--map.min.js': ['dist/JCHS-highcharts--map.js']
        }
      }
    },

    /* Stylelint */
    // Lint CSS files
    stylelint: {
      options: {
        configFile: '.stylelintrc.json',
        formatter: 'string',
        failOnError: false
      },
      src: ['src/css/*.css']
    },

    /* JSDoc */
    //generate API documentation
    jsdoc: {
      dist: {
        src: ['src/js/*.js', 'README.md'],
        options: {
          destination: 'docs',
          template: "node_modules/minami"
        }
      }
    },

    /* Karma */
    //cross-browser unit testing
    karma: {
      unit: {
        options: {
          frameworks: ['qunit'],
          files: [
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
            'https://code.highcharts.com/6.1.4/js/highcharts.js',
            'dist/JCHS-highcharts.js',
            'test/*.js'
          ],
          browsers: ['ChromeHeadless'], // Use only ChromeHeadless via Puppeteer
          reporters: ['progress', 'html', 'coverage'],
          preprocessors: {
            'dist/JCHS-highcharts.js': ['coverage'] //preprocess files to create coverage report
          },
          coverageReporter: {
            type : 'html',
            dir : 'test-results/code-coverage'
          },
          htmlReporter: {
            outputFile: 'test-results/unit-test-results.html',
            subPageTitle: 'JCHS-highcharts',
            //groupSuites: true,
            useLegacyStyle: true
          },
          singleRun: true, //exit after tests are completed
          autoWatch: true //don't automatically run tests when a file is changed
        }
      }
    }

  })

  // name the tasks 
  grunt.registerTask('default', ['eslint', 'babel', 'uglify', 'stylelint', 'postcss-cli', 'karma', 'jsdoc'])
  grunt.registerTask('test', ['karma'])
  grunt.registerTask('css', ['stylelint', 'postcss-cli'])
  grunt.registerTask('js', ['eslint', 'jsdoc', 'babel', 'uglify'])

  // PostCSS CLI task
  grunt.registerTask('postcss-cli', 'Run PostCSS CLI for CSS build', function() {
    const done = this.async();
    grunt.util.spawn({
      cmd: 'npx',
      args: [
        'postcss',
        'src/css/JCHS-highcharts.css',
        '-o',
        'dist/JCHS-highcharts.min.css'
      ],
      opts: { stdio: 'inherit' }
    }, function(error, result, code) {
      if (error) {
        grunt.log.error(result.stderr || error);
        done(false);
      } else {
        grunt.log.writeln(result.stdout);
        done();
      }
    });
  });

}
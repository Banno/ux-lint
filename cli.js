var chalk     = require('chalk');
var linter    = require('./');
var parseArgs = require('minimist');
var reporter  = require('./reporters/stylish');

var args = parseArgs(process.argv.slice(2));

var type = args.fix ? 'fix' : 'check';
var files = (!args._ || args._.length === 0) ? 'src' : args._;

linter[type](files, {}, function(err, results) {
	if (err) {
		console.log(chalk.red('Error: ') + err.message + '\n');
		console.trace();
		return;
	}
	reporter(results, args);
});

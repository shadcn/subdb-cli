#! /usr/bin/env node
var program = require('commander');
var subdb = require('./lib/subdb-cli.js');

// Get version from package.json.
var version = require('./package.json').version;

program
   .version(version)

/**
 * Download command.
 * subdb download [file].
 */
program
  .command('download [file]')
  .option("-l, --language <language>", 'The language of the subtitle.')
  .description('Use this command to download subtitle for a file.')
  .action(function(file, options){
    if (!file) {
      console.log('Error: file name missing');
      program.help();
    }

    // Use provided language or default to en.
    var language = options.language || 'en';

    // Download the subtitle.
    subdb.download(file, language);
  });

// Examples.
program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ subdb download video.avi');
  console.log('');
});

program.parse(process.argv);

if (!program.args.length) program.help();
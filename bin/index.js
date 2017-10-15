#!/usr/bin/env node

'use strict';

const LimitTreeSize = require("../index");
const commander = require("commander");

commander
    .version("1.0.4");

commander
  .command('launch')
  .option("--rootDir <rootDir>", "Root dir")
  .option("--level <level>", "Directory tree level folders to be watched")
  .option("--intervalAutoScan <intervalAutoScan>", "Interval in seconds to scan")
  .option("--defaultLimitMB <defaultLimitMB>", "Limit in MB per folder")
  .option("--verbose <verbose>", "Mode verbose")
  .description('Limit tree size')
  .action(async function(opts) {
    const dirLimiter = new LimitTreeSize(
      {
        "rootDir": opts.rootDir,
        "level": parseInt(opts.level),
        "forceDirs": [],
        "autoDiscoverNewSubDirs": true,
        "intervalAutoScan": parseFloat(opts.intervalAutoScan),
        "defaultLimitMB": parseFloat(opts.defaultLimitMB),
        "verbose": opts.verbose == "true"
      });

    dirLimiter.launch();
  });

commander
  .command('*')
  .description('')
  .action(async function() {
    console.log("Invalid command");
    commander.help();
  });

commander.parse(process.argv);

if ( ! commander.args.length)
  commander.help();

//Rename to team.js

#!/usr/bin/env node
const prog = require("caporal");
const eval_teamwise = require("./eval_teamwise");

prog
    .version("1.0.0")
    .description("Program to facilitate pairwise evaluation in CS F213 Labs")
    .argument("<teams>", "Path to the CSV data file or the SQL table name(use --sql option) for Team data")
    .argument("<scores>", "Path to the CSV data file or the SQL table name(use --sql option) for Scores data")
    .argument("[teamScorescsv]", "CSV file to store evaluations")
    .option('--sql <database> <user> <password>',"Configs for the SQL reads separated by commas", prog.LIST)
    .action(function(args, options, logger) {
        if(typeof options.sql !== 'undefined')
            args.sqlConfig = {
                db: options.sql[0], 
                user: options.sql[1], 
                password: options.sql[2]
            };
        eval_teamwise.writeResult(args, logger);
    });

/* eslint no-process-env: "off"*/
/* eslint no-undef : "off"*/

prog.parse(process.argv);

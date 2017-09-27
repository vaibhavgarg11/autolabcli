const Promise = require("bluebird");
const input = require("../input");
const Output = require("../output");
const _ = require("lodash");

/*
 * The function takes necessary arguments:
 * scorescsv : The path to the csv file corresponding to the scores of students
 * teamcsv : The path to the csv file corresponding to the teams of the students
 * [teamScorescsv] :  An optional argument specifying the path to the csv file to output evaluated marks
 *
 * @author: Chaitanya Mukka
 *
 */


var computeTeamResults = function(args, logger = console) {

    var databaseType = args.sqlConfig?"sql":"csv";
    var databseConfig = args.sqlConfig || undefined ;

    var promiseMarks = input(databaseType, args.scores, databseConfig).readContents();
    var promiseTeam = input(databaseType, args.teams, databseConfig).readContents();

    return Promise.all([promiseMarks, promiseTeam]).then(function(res) {
        // res contains the returns of all the promises in the order of as in the input array of promises
        const marks = res[0]; // [[team,score]]
        const teams = res[1]; // [[studentID,team]]
        
        /* teamView Object of the form:
         * {
         *   teamNumber : [Students of the team],
         * }
         */
        var teamView = _.transform(teams, function(result, team) {
            (result[team[1]] || (result[team[1]] = [])).push(team[0])
        }, {});


        marks.map(function(tup) {
            tup[1] = parseInt(tup[1]);
        });

        /* marksView Object of the form:
         * {
         *   team : [int(score) of memebers of team],
         * }
         */
        // creates the object of the above from from teams array
        var marksView = _.transform(marks, function(result, mark) {
            (result[mark[0]] || (result[mark[0]] = [])).push(mark[1])
        }, {})


        // finalMarks is of the form [[studentID, score]]
        var finalMarks = [
            ["studentID", "score"]
        ];
        /* eslint no-unused-vars : "off" */
        _.forIn(teamView, function(members, team) {
            // pick the objects corresponding to the team members from marksView, and get the scores in array;
            // find the max of the array if scores are submitted else 0
            var maxScore = _.max(_.values(marksView[team])) || 0

            // zip together the student id and the maxScore; type: [[id,score]]
            var updatedScores = _.zip(
                members,
                _.fill(Array(members.length), maxScore)
            );

            // for each of the member push them onto finalMarks
            _.forEach(updatedScores, tup => finalMarks.push(tup));
        });

        //log members those who don't have any assigned teams
        //var illegalInputs = _.omit(marksView, _.flatten(_.values(teamView)));
        //logger.info("Illegal inputs\n", illegalInputs);

        var writeUpdatedScore = new Output(finalMarks, args.teamScorescsv || "./teamScores.csv")
        return writeUpdatedScore.writeContents();
    }).catch(err => { logger.error(err)});
};

module.exports = {
    writeResult: computeTeamResults
};


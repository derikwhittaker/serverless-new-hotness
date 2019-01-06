
const logger = require('../lib/logger')

const dynamo = require('../facades/dynamo');

/**
 * Will pull the list of teams and return them by calculated points.
 * 3 for a win
 * 1 for a draw
 * 0 for a loss
 * 
 * @returns {object}
 ```
 [
     {
    "draws": "",
    "id": "",
    "losses": "",
    "teamName": "",
    "wins": "",
    "points": ""
    }
 ]
 ```
 */
async function teamsByPoints() {
    logger.info('leagueTableService.teamsByPoints', 'Attempting to pull and calculate teams by points');

    const teams = await dynamo.list('serverless-hotness-demo');

    const mappedTeams = teams.map(team => {
        const teamPoints = calculatePoints(team);
        team.points = teamPoints;

        return team;
    })

    const sortedTeams = mappedTeams.sort((left, right) => {
        if (left.points < right.points) { return 1; }
        if (left.points > right.points) { return -1; }

        return 0
    })

    return sortedTeams;
}

/**
 * Will determine the number of pointes each team currently has based on wins/losses/draws and return that total
 * 
 * @param {object} team 
 * 
 * @returns {number} Calculated points
 */
function calculatePoints(team) {

    const pointsFromWins = team.wins * 3;
    const pointsFromDraws = team.draws * 1;

    return pointsFromWins + pointsFromDraws;
}

module.exports = {
    teamsByPoints
}
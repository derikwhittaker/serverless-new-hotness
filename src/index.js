const logger = require('./lib/logger')

const leagueTableService = require('./services/leagueTableService')

async function handler() {
    logger.info('Index.handler', 'Attempting to startup Handler');

    const teamsResults = await leagueTableService.teamsByPoints();

    logger.debug('Index.handler', `Teams Results: ${JSON.stringify(teamsResults)} `);

    var response = {
        "statusCode": 200,
        "body": JSON.stringify(teamsResults)
    };

    return response;
}


exports.handler = handler
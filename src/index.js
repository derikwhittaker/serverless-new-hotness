const logger = require('./lib/logger')

const leagueTableService = require('./services/leagueTableService')

async function handler() {
    logger.info('Index.handler', 'Attempting to startup Handler');

    const teamsResults = await leagueTableService.teamsByPoints();

    logger.debug('Index.handler', `Teams Results: ${JSON.stringify(teamsResults)} `);

    return teamsResults;
}


exports.handler = handler
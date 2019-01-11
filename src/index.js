const logger = require('./lib/logger')
const leagueTableService = require('./services/leagueTableService')

/**
 * Handler which is invoked by triggering events
 * 
 * @returns {object}
 '''
 {
    statusCode: 200 || ???,
    body: [
        {
            losses: number,
            teamName: string,
            id: number,
            wins: number,
            draws: number,
            points: number
        }
    ]
 }
 '''
 */
async function handler() {
    logger.info('Index.handler', 'Attempting to startup Handler');

    try {
        const teamsResults = await leagueTableService.teamsByPoints();

        logger.trace('Index.handler', `Teams Results: ${JSON.stringify(teamsResults)} `);

        var response = {
            "statusCode": 200,
            "body": JSON.stringify(teamsResults)
        };

        return response;
    } catch (error) {
        logger.info('index.handler', JSON.stringify(error));

        return {
            statusCode: 400,
            error: error
        }
    }

}

exports.handler = handler
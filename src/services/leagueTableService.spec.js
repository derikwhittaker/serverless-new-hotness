
jest.mock('../lib/logger');
const sinon = require('sinon');

const leagueTableService = require('./leagueTableService');
const dynamo = require('../facades/dynamo');


describe('leagueTableService.spec', () => {

    let dynamoStub = null;
    let teamsStub = []

    beforeEach(() => {
        if (dynamoStub && dynamoStub.restore) {
            dynamoStub.restore();
        }

        teamsStub = [
            {
                "draws": "3",
                "id": "1",
                "losses": "1",
                "teamName": "Liverpool",
                "wins": "17"
            },
            {
                "draws": "2",
                "id": "2",
                "losses": "3",
                "teamName": "Manchester City",
                "wins": "16"
            }
        ]
    })

    describe('teamsByPoints', async () => {

        it('When invoked and data returned, will return correct number of teams', async () => {
            dynamoStub = sinon.stub(dynamo, 'list')
                .resolves(teamsStub);

            const teamsResults = await leagueTableService.teamsByPoints();

            expect(teamsResults).toHaveLength(2);
        });

        it('When invoked and data returned, will calculate the points correctly for each team', async () => {
            dynamoStub = sinon.stub(dynamo, 'list')
                .resolves(teamsStub);

            const teamsResults = await leagueTableService.teamsByPoints();

            const teamById1 = teamsResults.find(team => team.id === "1");
            const teamById2 = teamsResults.find(team => team.id === "2");

            expect(teamById1.points).toBe(54);
            expect(teamById2.points).toBe(50);
        });

        it('When invoked and data returned, will be sorted by highest points first', async () => {
            teamsStub.push({
                "draws": "0",
                "id": "3",
                "losses": "0",
                "teamName": "SUPER TEAM",
                "wins": "20"
            })
            dynamoStub = sinon.stub(dynamo, 'list')
                .resolves(teamsStub);

            const teamsResults = await leagueTableService.teamsByPoints();

            const teamById1 = teamsResults.find(team => team.id === "1");
            const teamById2 = teamsResults.find(team => team.id === "2");

            expect(teamsResults[0].points).toBe(60);
            expect(teamsResults[1].points).toBe(54);
            expect(teamsResults[2].points).toBe(50);
        });

    });

});
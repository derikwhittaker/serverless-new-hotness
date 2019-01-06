jest.mock('./lib/logger');
const sinon = require('sinon');

const leagueTableService = require('./services/leagueTableService');
const index = require('./index');

describe('index.spec', () => {

    let serviceStub = null;

    beforeEach(() => {
        if (serviceStub && serviceStub.restore) {
            serviceStub.restore();
        }

    })

    describe('handler', () => {

        it('When calling, will make correct service call and return data', async () => {
            serviceStub = sinon.stub(leagueTableService, 'teamsByPoints')
                .resolves([]);

            await index.handler();

            expect(serviceStub.callCount).toBe(1);
        });

    });

});
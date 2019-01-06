
const AWS = require('aws-sdk');
const logger = require('../lib/logger')

const docClient = new AWS.DynamoDB.DocumentClient();

function list(tableName, queryArguments = {}) {
    logger.info('dynamoDocument.list', `Pulling all items from dynamo with ${JSON.stringify(queryArguments, null, 2)}`);

    const filterParams = listScanArgumentsBuilder(tableName, queryArguments);

    logger.debug('dynamoDocument.list', `Scanning for data w/ ${JSON.stringify(filterParams, null, 2)}`)
    return docClient.scan(filterParams)
        .promise()
        .then(results => {
            logger.debug('dynamoDocument.list', `Results of ${JSON.stringify(results.Items, null, 2)}`)
            logger.info('dynamoDocument.list', `Returned a total of ${results.Count}`);

            return (results.Items || []);
        })
        .catch(error => {
            logger.error('dynamoDocument.list', `Unhandled error of ${error} with stack of ${error.stack}`);
            throw error;
        })
}

function listScanArgumentsBuilder(tableName, queryArguments) {
    if (!tableName) { throw new Error("TableName was not provided, this is required"); }
    if (typeof tableName !== 'string') { throw new Error("TableName provided was not a string, this is required"); }
    if (tableName.length === 0) { throw new Error("TableName provided was empty, this is required"); }

    let expressionAttributeValues = {};
    let filterExpressions = [];

    for (let property in queryArguments) {
        const key = `:${property}`;
        expressionAttributeValues[key] = queryArguments[property];
        filterExpressions.push(`${property} = ${key}`)
    }

    // if queryArguments is empty we need to return null FilterExpression and AttributeValuess
    return {
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(" AND ") : null,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : null,
        TableName: tableName
    };
}

module.exports = {
    list
}
import dbClient from './db-services/db-client';

let configData = {};

dbClient.getConfigData().then(data => {
    configData = data;
});


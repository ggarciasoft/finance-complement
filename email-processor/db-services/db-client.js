const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const CONFIG_PATH = path.join(process.cwd(), '..', 'configuration-files', 'db-config.json');

const { MongoClient } = require('mongodb');

async function getDb() {
    try {
        const content = await fs.readFile(CONFIG_PATH);
        const config = JSON.parse(content);
        return new MongoClient(config.connectionString).db(config.dbName);
    } catch (err) {
        return null;
    }
}

export default {
    getConfigData: async function () {
        let db = await getDb();
        if (db) {
            return db.collection("config-data").find();
        }
        return {};
    }
};
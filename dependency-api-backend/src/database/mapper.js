// ./src/database/ads.js
const { getDatabase } = require('./mongo');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const { parse } = require('@babel/parser');
const path = require('path');

/**
 * functions to traverse a directory, parse all .js files,
 * and store their ASTs in a database for retrieval via API
 */

const args = process.argv.slice(2);
const elementDestination = 'elements.json';
const collectionName = 'fileASTs';
const mapDir = '../';
const excludedDirs = [
    'node_modules',
    'dist'
];

async function getMap() {
    const database = await getDatabase();
    return await database.collection(collectionName).find({}).toArray();
}

async function insertNode(node) {
    if (!node) { return; }
    const database = await getDatabase();
    const { insertedId } = await database.collection(collectionName).insertOne(node);
    if (args.length > 0 && args[0] === 'save') {
        fs.appendFile(elementDestination, JSON.stringify(node, null, 4), (error) => {
            error && errorAlert(error);
        });
    }
    console.log('inserting node...' + node.name);
    return insertedId;
}

async function parseFile(filename, content) {
    const parsedFile = parse(content, {
        sourceType: "unambiguous",
        sourceFilename: filename,
        errorRecovery: true,
        plugins: [
            "jsx",
        ]
    });
    await insertNode({ name: filename, AST: parsedFile, sourceDir: mapDir });
}

function readFiles(dirName, onFileContent, onError) {
    fs.readdir(dirName, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            const fullPathToFile = path.join(dirName, filename);
            fs.stat(fullPathToFile, function(err, stats) {
                if (err) {
                    onError(err);
                } else if (stats.isDirectory()) {
                    if (!excludedDirs.includes(filename)) {
                        readFiles(fullPathToFile, onFileContent, onError);
                    }
                } else if (stats.isFile()) {
                    if (fileIsJs(filename)) {
                        fs.readFile(fullPathToFile, 'utf-8', function(err, content) {
                            if (err) {
                                onError(err);
                                return;
                            }
                            onFileContent(filename, content);
                        });
                    }
                }
            });
        });
    });
}

function fileIsJs(filename) {

    const jsExt = path.extname(filename) === '.js';
    const noOtherExt = path.extname(path.basename(filename, '.js')) === '';
    return jsExt && noOtherExt;
}

function startMap() {
    if (args.length > 0 && args[0] === 'save') {
        fs.writeFile(elementDestination, '', (error) => {
            error && errorAlert(error);
        });
    }
    readFiles(mapDir, parseFile, errorAlert);
}

function errorAlert(err) {
    console.log('Oh jeez, an error! ' + err);
}

// async function deleteAd(id) {
//     const database = await getDatabase();
//     await database.collection(collectionName).deleteOne({
//         _id: new ObjectId(id),
//     });
// }

// async function updateAd(id, ad) {
//     const database = await getDatabase();
//     delete ad._id;
//     await database.collection(collectionName).update({ _id: new ObjectId(id), }, {
//         $set: {
//             ...ad,
//         },
//     }, );
// }

module.exports = {
    getMap,
    startMap
};
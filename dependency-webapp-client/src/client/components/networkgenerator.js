const path = require('path');
const dimensions = 3500;
const excludeFiles = [
    'messages.js',
    'be.js'
];

String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Class to generate elements for a cytoscape network from an AST supplied by
 * the backend API
 */
export default class NetworkGenerator {
    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    async generateElements() {
        await fetch('http://127.0.0.1:3001')
            .then(response => {
                return response.json();
            }).then(data => {
                console.log(data);
                data.forEach(element => {
                    const fileAST = element.AST;
                    const fileElements = fileAST.program.body;
                    const importElements = fileElements.filter(element => element.type === "ImportDeclaration");

                    try {
                        const node = this.createNode(fileAST);
                        node && this.nodes.push(node);
                        importElements.forEach((importElement) => {
                            const edge = this.createEdge(importElement);
                            edge && this.edges.push(edge);
                        });

                    } catch (e) {
                        console.log(e);
                    }
                });
            });

        this.dropHangingEdges();

        return {
            "nodes": this.nodes,
            "edges": this.edges
        };
    }

    createNode(fileAST) {
        const filename = this.normalizeFilename(fileAST.loc.filename);
        if (excludeFiles.includes(filename)) {
            console.log('excluding: ' + filename);
            return null;
        }
        const id = filename.hashCode();
        const x = getRandomInt(dimensions);
        const y = getRandomInt(dimensions);

        return {
            "data": {
                "id": id,
                "selected": false,
                "cytoscape_alias_list": [
                    filename
                ],
                "canonicalName": filename,
                "SUID": id,
                "NodeType": fileAST.type,
                "name": filename,
                "shared_name": filename,
                "orgPos": {
                    "x": x,
                    "y": y
                }
            },
            "position": {
                "x": x,
                "y": y
            },
            "selected": false
        };
    }

    createEdge(importElement) {
        const sourceFilename = this.normalizeFilename(importElement.loc.filename);
        const targetFilename = this.normalizeFilename(importElement.source.value);
        const source = sourceFilename.hashCode();
        const target = targetFilename.hashCode();
        const id = (importElement.loc.filename + importElement.source.value).hashCode();
        const name = sourceFilename + " (imports) " + targetFilename;


        return {
            "data": {
                "id": id,
                "source": source,
                "target": target,
                "selected": false,
                "canonicalName": name,
                "SUID": id,
                "name": name,
                "interaction": "import",
                "shared_interaction": "import",
                "shared_name": name,
            },
            "selected": false
        };
    }

    normalizeFilename(filename) {
        const basename = path.basename(filename);
        if (path.extname(basename) === '.js') {
            return basename;
        }
        return basename + '.js';
    }

    // remove edges that don't have both source and target present in nodes
    dropHangingEdges() {
        this.edges = this.edges.filter(edge =>
            this.nodes.filter(node => edge.data.source === node.data.id).length > 0 &&
            this.nodes.filter(node => edge.data.target === node.data.id).length > 0
        );
    }
}
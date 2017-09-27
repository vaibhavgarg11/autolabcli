//need to make changes in the eval _teamwise.js from 19 to 24 to remove the sql conditions and simultaneously in index.js for function calls
const Promise = require("bluebird");
const parser = Promise.promisify(require("csv-parse"));
const readFile = Promise.promisify(require("fs").readFile);
const _ = require("lodash");


class Input {
    
    readContents(args){
        return this.read(args);
    }
}

class CsvInput extends Input{
    constructor(file){
        super();
        this.options = {
            trim: true,
            auto_parse: false,
            columns: this.setHeaders.bind(this)  
        };
        this.file = file;
    }

    read(){
        return readFile(this.file, "utf8").then(this.parse.bind(this));
    }

    parse(content){
        return parser(content, this.options);
    }

    setHeaders(headers){
        this.headers = headers;
    }
} 

module.exports = function(source) {
    return new CsvInput(source);
}
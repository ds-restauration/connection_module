var p = require('path')
var fs = require('fs')
const yaml = require('yaml');

var argv = require('minimist')(process.argv.slice(2));

var config = { ...yaml.parse(fs.readFileSync(p.resolve(__dirname, `config.yaml`), 'utf-8')), ...argv}

module.exports = config;
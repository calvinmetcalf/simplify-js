#!/usr/bin/env node

var simplify = require('./simplify');
var fs = require('fs');
var input = process.argv[2];
var output = process.argv[3];
var tolerance = process.argv[4];

fs.readFile(input,{encoding:'utf8'},function(err,file){
    if(err){
        return;
    }
    var points = JSON.parse(file);
    console.log('before',points.length);
    var after = simplify(points,tolerance,true);
    console.log('after',after.length);
    fs.writeFile(output,JSON.stringify(after),{encoding:'utf8'},function(err){
        if(err){
            console.log(err);
        }else{
            console.log('done');
        }
    });
});

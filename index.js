var through = require('through2');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');
var async = require('async');
var path = require('path');

const PLUGIN_NAME = 'gulp-bundle-libs';

module.exports = function(config) {
    var defaults = {
        profiles: [],
        moduleDirectory: 'node_modules'
    };

    config = Object.assign(defaults, config);

    return through.obj(function(file, enc, cb) {
        if (file.isNull())
            return cb(null, file);

        var save = this,
            assets = {};

        if (file.isBuffer())
            assets = JSON.parse(file.contents.toString());

        async.each(Object.entries(assets), function(profile, profileComplete) {
            var profileName = profile[0];

            if (config.profiles.length > 0 && !config.profiles.includes(profileName)) {
                profileComplete();
                return;
            }

            async.each(Object.entries(profile[1]), function(operations, operationComplete) {
                var temp = operations[0].split('@'),
                    outputFile = temp[0],
                    action = temp[1],
                    files = vfs.src(operations[1], {
                        cwd: config.moduleDirectory,
                        buffer: true,
                        read: true,
                        allowEmpty: true
                    });

                switch (action) {
                    case 'concat':
                        var content = [];

                        files
                            .pipe(through.obj(function(file, enc, done) {
                                content.push(file.contents);
                                content.push(new Buffer('\n'));
                                done();
                            }, function(close) {
                                var newFile = new Vinyl({
                                    path: outputFile,
                                    contents: Buffer.concat(content)
                                });

                                save.push(newFile);
                                close();
                                operationComplete();
                            }));
                        break;

                    case 'copy':
                        files
                            .pipe(through.obj(function(file, enc, done) {
                                var newFile = new Vinyl({
                                    path: path.join(outputFile,file.relative),
                                    contents: file.contents
                                });

                                save.push(newFile);
                                done();
                            }, function(close){
                                close();
                                operationComplete();
                            }));
                        break;

                }
            }, profileComplete);
        }, function() {
            cb(null)
        });
    });
};

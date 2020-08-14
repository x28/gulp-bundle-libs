var through = require('through2');
var _ = require('underscore');
var vfs = require('vinyl-fs');
var Vinyl = require('vinyl');
var async = require('async');
var path = require('path');

const PLUGIN_NAME = 'gulp-bundle-libs';

module.exports = function(config) {
    if (!config)
        config = {};

    _.defaults(config, {
        profiles: [],
        moduleDirectory: 'node_modules'
    });

    return through.obj(function(file, enc, cb) {
        if (file.isNull())
            return cb(null, file);

        var save = this,
            base = path.dirname(file.path),
            assets = {};

        if (file.isBuffer())
            assets = JSON.parse(file.contents.toString());

        async.each(_.pairs(assets), function(profile, profileComplete) {
            var profileName = profile[0];

            if (!_.isEmpty(config.profiles) && !_.contains(config.profiles, profileName)) {
                profileComplete();
                return;
            }

            async.each(_.pairs(profile[1]), function(operations, operationComplete) {
                var temp = operations[0].split('@'),
                    outputFile = temp[0],
                    action = temp[1],
                    files = vfs.src(_.map(operations[1], function(file) {
                        return path.join(config.moduleDirectory, file);
                    }), {
                        cwd: process.cwd(),
                        buffer: true,
                        read: true
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
                                    path: path.join(base, outputFile),
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
                                    path: path.join(base, outputFile, file.relative),
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

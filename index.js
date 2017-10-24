var through = require('through2');
var _ = require('underscore');
var vfs = require('vinyl-fs');
var async = require('async');
var path = require('path');
var gulpUtil = require('gulp-util');

const PLUGIN_NAME = 'gulp-bundle-libs';

module.exports = function(config) {
    if (!config)
        config = {};

    _.defaults(config, {
        prefix: false,
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

        async.each(_.pairs(assets), function(pack, exit) {
            var name;

            if (_.isFunction(config.prefix)) {
                name = _.partial(config.prefix, _, pack[0]);
            }
            else if (_.isString(config.prefix)) {
                name = function() {
                    return config.prefix.replace('{{PREFIX}}', pack[0])
                };
            }
            else if (config.prefix === false) {
                name = function(filebase) {
                    return filebase;
                };
            }
            else {
                name = function(filebase) {
                    return [pack[0], filebase].join('.');
                };
            }

            async.each(_.pairs(pack[1]), function(segment, endOnePrefixPack) {
                var temp = segment[0].split('@'),
                    outputFile = temp[0],
                    action = temp[1],
                    files = vfs.src(_.map(segment[1], function(file) {
                        return path.join(config.moduleDirectory, file);
                    }), {
                        cwd: process.cwd(),
                        buffer: true,
                        read: true
                    });

                switch (action) {
                    case 'concat':
                        var content = [],
                            error = [];

                        files
                            .pipe(through.obj(function(file, enc, done) {
                                content.push(file.contents);
                                content.push(new Buffer('\n'));
                                done();
                            }, function(close) {
                                var newFile = new gulpUtil.File({
                                    path: path.join(base, name(outputFile)),
                                    contents: Buffer.concat(content)
                                });

                                save.push(newFile);
                                close();
                                endOnePrefixPack();
                            }));
                        break;

                    case 'copy':
                        files
                            .pipe(through.obj(function(file, enc, done) {
                                var newFile = new gulpUtil.File({
                                    path: path.join(base, name(outputFile), file.relative),
                                    contents: file.contents
                                });

                                save.push(newFile);
                                done();
                            }, function(close){
                                close();
                                endOnePrefixPack();
                            }));
                        break;

                }
            }, exit);
        }, function() {
            cb(null)
        });
    });
};
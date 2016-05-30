var lr = require('line-reader');
var ymlog = require('./ym-log-function.js');
var ym = require('./ym-function.js');
var async = require('async');
var _ = require( 'underscore' );

// parser
var loginparser = require('./parser/login.js');
var logoffparser = require('./parser/logoff.js');
var recharge_parse = require('./parser/recharge.js').recharge;
var monthcard_parse = require('./parser/recharge.js').monthcard;
var hero_composite_parse = require('./parser/hero-composite.js');

// 连接数据库
var db = require('./modules/ym-database.js');
db.initDBPool();

// real-time log path
var real_time_log_path = __dirname + "/../../Log/analyze";

function parseRealTime( cb ){
    var files = ym.scanFolder( real_time_log_path );
    var logs = [];
    var loop_count = 0;
    var ready = false;
    _.each( files.files, function( filename ){
        if( ymlog.isTodayLoginLog( filename ) ) {
            loop_count++;
            (function (file_n) {
                var postfix = ymlog.getStringWithServerId(file_n);
                lr.eachLine(file_n, function (line, last) {
                    if( line.length > 0 ) {
                        line += postfix;
                        if( line.indexOf("{") > 0 && line.indexOf("date")>0 ){
                            // 判断"的数量，双数才可

                            logs.push(( ymlog.parseLine(line) ));
                        }
                    }
                }).then(function () {
                    async.eachSeries(logs, async.applyEach([ loginparser, logoffparser ]), function (err) {
                        --loop_count;
                        if( !loop_count && ready && cb ) {
                            // 全部结束
                            cb();
                        }
                    });
                });
            })(filename);
        }
    });
    ready = true;
    if( !loop_count && cb ){
        cb();
    }
}

function parseOneDay( cb ){
    var files = ym.scanFolder( real_time_log_path );
    var logs = [];
    var loop_count = 0;
    var ready = false;
    _.each( files.files, function( filename ){
        if( ymlog.isYesterdayAnalyseLog( filename ) ) {
            loop_count++;
            (function (file_n) {
                var postfix = ymlog.getStringWithServerId(file_n);
                lr.eachLine(file_n, function (line, last) {
                    if( line.length > 0 ) {
                        line += postfix;
                        if( line.indexOf("{") > 0 && line.indexOf("date")>0 ){
                            // 判断"的数量，双数才可
                            logs.push(( ymlog.parseLine(line) ));
                        }
                    }
                }).then(function () {
                    _.each( logs, function( log ){
                        hero_composite_parse( log );
                    });
//                    async.eachSeries(logs, async.applyEach([ hero_composite_parse ]), function (err) {
//                        --loop_count;
//                        if( !loop_count && ready && cb ) {
//                            // 全部结束
//                            cb();
//                        }
//                    });
                });
            })(filename);
        }
    });
    ready = true;
    if( !loop_count && cb ){
        cb();
    }
}

//parseOneDay();

parseRealTime();

// 实时分析（5分钟）
( function startParsingRealTime(){
    setTimeout( function(){
        parseRealTime( startParsingRealTime );
    },  5 * 60 * 1000)
})();


//分析充值
var recharge_parser = require('./parser/recharge-realtime.js');
recharge_parser.start();


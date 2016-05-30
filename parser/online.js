/**
 * Created by jiayi on 14/11/27.
 */
var ticker = require('../modules/time_ticker.js');
var online_db = require('../modules/online-database.js');
var ym_db = require('../modules/ym-database.js');
var ym = require('../ym-function.js');
var online_parser = (function (m) {

    ///////////////////////////////////////data structure
    ///////////////////////////////////////public variables
    ///////////////////////////////////////private variables
    ///////////////////////////////////////public functions
    m.start = function( server_id,  fcb ){
        ticker.runFunctionAtMinute( parseServer, server_id, fcb );
    };
    ///////////////////////////////////////private functions
    var parseServer = function( server_id, fcb ){
        var date = new Date();
        online_db.initDBPool( server_id );
        // 查询server的online表并添加到platform的online表
        var query = 'select * from online';
        online_db.query( server_id, query, function( err, rows ){
            if( err ){
                throw err;
            }
            ym.log('server online count:%d', rows.length );

            // 去掉描述，只剩分钟
            var minute_time = (new Date( date.getFullYear(), date.getMonth(), date.getDate(),
                date.getHours(), date.getMinutes(), 0, 0 ) ).getTime();
            // query
            var query = 'replace into online values(%d,%d,%d)';
            query = ym.sprintf( query, rows.length, server_id, minute_time );
            ym_db.query( query, function( err, rows ){
                if( err ){
                    throw err;
                }
                if( fcb )
                { fcb(); }
            })
        })
    };

    return m;
}(online_parser || {}) );

module.exports = online_parser;

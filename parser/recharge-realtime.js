/**
 * Created by jiayi on 14/11/27.
 */
var ticker = require('../modules/time_ticker.js');
var recharge_db = require('../modules/platform-database.js');
var ym_db = require('../modules/ym-database.js');
var ym = require('../ym-function.js');
var _ = require( 'underscore' );
var recharge_parser = (function (m) {

    ///////////////////////////////////////data structure
    ///////////////////////////////////////public variables
    ///////////////////////////////////////private variables
    ///////////////////////////////////////public functions
    m.start = function( fcb ){
        ticker.runFunctionAtMinute( parseServer, 0, fcb );
    };
    ///////////////////////////////////////private functions
    var parseServer = function( server_id, fcb ){
        var date = new Date();
        // 10分钟前到现在
        var start_time = (date.getTime() - 60 * 5000 * 1000)/1000;
        var end_time = date.getTime() / 1000;
        recharge_db.initDBPool();
        // 查询server的online表并添加到platform的online表
        var query = 'select * from paysuccess where paytime >= %d and paytime < %d';
        query = ym.sprintf( query, start_time, end_time );
        recharge_db.query( query, function( err, rows ){
            if( err ){
                throw err;
            }

            var count = 0;
            var ready = false;
            _.each( rows, function( row ){
                var month = 0;
                if( row.itemid.indexOf("month") > 0 ){
                    month = 1;
                }
                count++;
                query = ym.sprintf("replace into recharge_realtime values (%d, '%s',%d,%d,%d,%d,%d,'%s')",
                    row.pid, row.guid, row.paytime, row.channel, row.gssid, row.netincome,month,
                    (new Date(row.paytime*1000)).toLocaleString() );
                ym_db.query(query, function (err, rows, field) {
                    if (err) {
                        throw err;
                    }
                    --count;
                    if( count == 0 && ready && fcb ) {
                        fcb();
                    }
                });
            });
            ready = true;
            if( count == 0 && fcb ){
                fcb();
            }
        })
    };

    return m;
}(recharge_parser || {}) );

module.exports = recharge_parser;

/**
 * Created by jiayi on 14/11/18.
 */

var ym = require('../ym-function.js');
var ymlog = require('../ym-log-function.js');
var ymdb = require('../modules/ym-database.js');
var async = require('async');

// log格式
//"log":20002,"content":{"name":"logoff","online_time":"888888"}
var parser = function( log, fcb ){
    // log类型
    var log_type = "logoff";

    if( !log || !log.content )
    { fcb(); return log; }

    if( log.content.name !== log_type )
    { fcb(); return log; }

    ym.log("parsing: %s", JSON.stringify( log ));

    // 获得时间
    var date = ym.parseDate( log.date );
    var logoff_time = date.getTime() / 1000;

    // 制作login_detail表
    function createLogoffDetail(){
        var query = ym.sprintf( "replace into logoff_detail values(%d,%d,%d,%d,%d,%d,%d)", log.account_id, logoff_time,parseInt( log.content.online_time ), log.channel_id, log.server_id,log.level, log.vip );
        ymdb.query( query, function( err, rows, field ){
            if (err) {
                throw err;
            }

            query = ym.sprintf("update player set level=%d,vip=%d where player_id=%d" , log.level, log.vip, log.player_id );
            ymdb.query(query, function (err, rows, field) {
                if (err) {
                    throw err;
                }
                fcb();
            });
        })
    }

    createLogoffDetail();
    return log;
};

module.exports = parser;
/**
 * Created by jiayi on 14/11/14.
 */

var ym = require('../ym-function.js');
var ymlog = require('../ym-log-function.js');
var ymdb = require('../modules/ym-database.js');
var async = require('async');

// log格式
//"log":20001,"content":{"name":"login","machine_code":"%s"}
var parser = function( log, fcb ){
    // log类型
    var log_type = "login";

    if( !log || !log.content )
    { fcb(); return log; }

    if( log.content.name !== log_type )
    { fcb(); return log; }

    ym.log("parsing: %s", JSON.stringify( log ));

    // 获得时间
    var date = ym.parseDate( log.date );
    var login_time = date.getTime() / 1000;

    // 制作player表
    function createPlayerTable( cb ){
        // 检查是否已经存在machine code 或者 player_id
        var query = ym.sprintf("select * from player where player_id = %d AND server_id = %d", log.player_id, log.server_id );
//        var query = ym.sprintf("select * from player where player_id = %d AND machine_code = '%s' AND server_id = %d", log.player_id, log.content.machine_code, log.server_id );
        ymdb.query(query, function( err, rows, fields ) {
            if (err) {
                throw err;
            }

            // 如果没有找到就添加进数据库
            var r_login_time = login_time;
            var register_time = r_login_time;
            if(rows[0]){
                register_time = Math.min( r_login_time, rows[0].register_time );
                r_login_time = Math.max( r_login_time, rows[0].login_time );
            }
            if (rows.length == 0 || r_login_time != register_time ) {
                query = ym.sprintf("replace into player values (%d,%d,'%s',%d,%d,%d,'%s', %d,%d,%d)", log.account_id, log.player_id, log.content.machine_code, register_time, r_login_time, log.channel_id, log.account, log.server_id,log.level,log.vip);
                ymdb.query(query, function (err, rows, field) {
                    if (err) {
                        throw err;
                    }
                    cb();
                });
            }
            else{
                cb();
            }
        });
    }

    // 制作login_detail表
    function createLoginDetail( cb ){
        var query = ym.sprintf( "replace into login_detail values(%d,%d,'%s',%d, %d)", log.account_id, login_time, log.content.machine_code, log.channel_id, log.server_id );
        ymdb.query( query, function( err, rows, field ){
            if (err) {
                throw err;
            }
            cb();
        })
    }

    async.parallel( [ createPlayerTable, createLoginDetail ], function(){
        fcb();
    } );

    return log;
};

module.exports = parser;

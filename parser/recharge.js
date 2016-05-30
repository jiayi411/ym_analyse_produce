/**
 * Created by jiayi on 14/12/13.
 */
//20010,"log":20010,"content":{"name":"recharge","payload":"%s","commodity_id":%s,"commodity_count":%d,"buy":%d,"present":%d}
//20011,"log":20011,"content":{"name":"month_card","payload":"%s","commodity_id":%s,"commodity_count":%d}
var ym = require('../ym-function.js');
var ymlog = require('../ym-log-function.js');
var ymdb = require('../modules/ym-database.js');
var async = require('async');

var recharge_parser = function( log, fcb ){
    // log类型
    var log_type = "recharge";

    if( !log || !log.content )
    { fcb(); return log; }

    if( log.content.name !== log_type )
    { fcb(); return log; }

    ym.log("parsing: %s", JSON.stringify( log ));

    // 获得时间
    var date = ym.parseDate( log.date );
    var recharge_time = date.getTime() / 1000;

    // 制作recharge表
    function createRechargeTable() {
        // 检查是否已经存在购买时间+accountid
        var query = ym.sprintf("select * from recharge where account_id = %d AND buy_time = %d", log.account_id, recharge_time);
        ymdb.query(query, function (err, rows, fields) {
            if (err) {
                throw err;
            }

            // 如果没有找到就添加进数据库
            query = ym.sprintf("replace into recharge values (%d,%d,%d,%d,%d,%d,%d,%d,%d,'%s','%s')",
                log.account_id, recharge_time, log.channel_id, log.server_id, log.level,
                log.vip, log.content.buy, log.content.present, 0, log.name, date.toLocaleString() );
            ymdb.query(query, function (err, rows, field) {
                if (err) {
                    throw err;
                }
                fcb();
            });

        });
    }

    createRechargeTable();
    return log;
};

var monthcard_parser = function( log, fcb ){
    // log类型
    var log_type = "month_card";

    if( !log || !log.content )
    { fcb(); return log; }

    if( log.content.name !== log_type )
    { fcb(); return log; }

    ym.log("parsing: %s", JSON.stringify( log ));

    // 获得时间
    var date = ym.parseDate( log.date );
    var recharge_time = date.getTime() / 1000;

    // 制作recharge表
    function createMonthTable() {
        // 检查是否已经存在购买时间+accountid
        var query = ym.sprintf("select * from recharge where account_id = %d AND buy_time = %d", log.account_id, recharge_time);
        ymdb.query(query, function (err, rows, fields) {
            if (err) {
                throw err;
            }

            // 如果没有找到就添加进数据库
            query = ym.sprintf("replace into recharge values (%d,%d,%d,%d,%d,%d,%d,%d,%d)", log.account_id, recharge_time, log.channel_id, log.server_id, log.level, log.vip, 300, 0, 1 );
            ymdb.query(query, function (err, rows, field) {
                if (err) {
                    throw err;
                }
                fcb();
            });

        });
    }

    createMonthTable();
    return log;
};

module.exports.recharge = recharge_parser;
module.exports.monthcard = monthcard_parser;
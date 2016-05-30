/**
 * Created by jiayi on 15/11/27.
 */

var ym = require('../ym-function.js');
var ymlog = require('../ym-log-function.js');
var ymdb = require('../modules/ym-database.js');

// log格式
//"log":20001,"content":{"name":"hero_composite","profession":%d,"count":%d,"result":%d}
var parser = function( log, fcb ){
    // log类型
    var log_type = "hero_composite";

    if( !log || !log.content )
    { if( fcb ){fcb();} return log; }

    if( log.content.name !== log_type )
    { if( fcb ){fcb();} return log; }

    ym.log("parsing: %s", JSON.stringify( log ));

    // 获得时间
    var date = ym.parseDate( log.date );
//    var login_time = date.getTime() / 1000;

    // 制作hero_composite表
    function createLoginDetail(cb){
        var query = ym.sprintf( "insert into hero_composite values(%d,%d,%d,%d,%d,%d,%d)",0, log.content.profession,log.content.count,log.server_id,log.channel_id,log.account_id,log.content.result );
        ymdb.query( query, function( err, rows, field ){
            if (err) {
                throw err;
            }
            if( cb ) {
                cb();
            }
        })
    }
    createLoginDetail( fcb );
    return log;
};

module.exports = parser;

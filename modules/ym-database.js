/**
 * Created by jiayi on 14/11/14.
 */

var ymdb = ymdb || {};
module.exports = ( function(m){

    var mysql = require('mysql');
    var ym = require('../ym-function.js');

    m.connection = 0;
    m.pool = 0;

    var usePool = true;

    // 数据库pool
    m.initDBPool = function(){
        m.pool = mysql.createPool({
            host     : 'platform.mysql.rds.aliyuncs.com',
            user     : 'platform_analyse',
            password : '99_abc-123',
            database : 'analyse'
        });
    };

    // 查询
    m.query = function( query, cb ){
        if( usePool ){
            m.pool.getConnection( function( err, connection ){
                if( connection ) {
                    connection.query(query, function (err, rows, field) {
                        cb(err, rows, field);
                        connection.release();
                    });
                }
            })
        }else{
            m.connection.query( query, cb );
        }
    };

    // 断开
    m.end = function(){
        if(m.connection){
            m.connection.end();
            ym.log('db disconnected');
            return;
        }
        ym.log('no db connection');
    };

    //

    return m;
})( ymdb );
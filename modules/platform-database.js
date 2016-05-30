/**
 * Created by jiayi on 14/11/14.
 */

var _ = require( 'underscore' );

var platformdb = platformdb || {};
module.exports = ( function(m){

    var mysql = require('mysql');
    var ym = require('../ym-function.js');

    m.connection = 0;
    m.pools = [];

    var usePool = true;

    // 数据库pool
    m.initDBPool = function( ){
        if( m.pool ){
            return;
        }
        m.pool = mysql.createPool({
            host     : '61.219.14.190',
            user     : 'root',
            password : 'e04su3su6',
            database : 'platform'
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
})( platformdb );
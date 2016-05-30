/**
 * Created by jiayi on 14/11/14.
 */
var ymlog = ymlog || {};
module.exports = ( function(m){

    var ym = require('./ym-function.js');

    // 获得log类型
    // ret: number
    m.getLogType = function( line ){

    };

    // 解析log到对象中并返回
    m.parseLine = function( line ){
        // 替换所有\为\\
        line = line.replace('\\', '\\\\' );
        try{
            return eval("({"+line+"})");
        }catch( e )
        {
            ym.log(e.name+":"+ e.message);
            return "err";
        }
    };

    // 根据完整路径，返回folder名（即server id）
    m.getFolderName = function( path ){
        if( !path ){ return; }
        return path.slice( path.lastIndexOf('/') + 1 );
    };

    // 根据文件名完整路径，返回带有server id的object
    m.getStringWithServerId = function( file_name ){
        if( !file_name ){ return ""; }
        var server_id = file_name.slice( 0, file_name.lastIndexOf('/') );
        server_id = server_id.slice( server_id.lastIndexOf( '/' ) + 1 );
        return ",'server_id':" + server_id;
    };

    // 是否是js文件
    m.isLog = function( file_name ){
        return ( file_name.slice( file_name.lastIndexOf('.') + 1 ) == 'log');
    };

    // 是否是当天的login文件
    m.isTodayLoginLog = function( file_name ){
        return file_name.match( '/*Login-Game[1-9].log$' ) != null;
        //return file_name.indexOf( 'Login-Game1.log.2015-02-25' ) > 0;
    };

    return m;
})( ymlog );
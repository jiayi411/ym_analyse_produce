/**
 * Created by jiayi on 14/11/27.
 */
// 可在指定的时间定点循环某个事件
var time_ticker = (function (m) {

    ///////////////////////////////////////data structure
    ///////////////////////////////////////public variables
    ///////////////////////////////////////private variables
    ///////////////////////////////////////public functions
    // 在每个整分钟，执行一次回调
    m.runFunctionAtMinute = function( cb ){
        // 按秒为单位轮训到整点
        var left_args = [].slice.call( arguments, 1 );
        var inter_id = setInterval( function(){
            // 判断是否为整点(S:0)
            var date = new Date();
            if( date.getSeconds() == 0 ){
                clearInterval( inter_id );
                // 开始循环
                var args = [];
                args.push( cb );
                args.push( 60 * 1000 );
                [].push.apply( args, left_args.slice() );
                setInterval.apply(this, args);
            }
        }, 1000 );
    };
    ///////////////////////////////////////private functions

    return m;
}(time_ticker || {}) );

module.exports = time_ticker;


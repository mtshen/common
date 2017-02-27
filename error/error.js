/**
 * 抛出一组异常
 * 使用 console.group 抛出
 * @param {String} title 抛出异常的标题
 * @param {Array} errorArray 抛出异常组成员
 * @param {String} type 以何种类型进行抛出 {log | info | error}
 */
function throwError(title = '', errorArray = [], type = 'log') {
    console.group(title);
    errorArray.forEach(function(errLog) {
        errLog instanceof Array ?
            console[type].apply(window, errLog) :
            console[type].call(window, errLog);
    });
    console.groupEnd();
}

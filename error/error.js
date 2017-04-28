const ERROR_OPTION = new Proxy({
    FLAG: 1
}, {
    get: function(target, key) {
        switch (key) {
            case 'HIDE':
                target.FLAG = 0;
                break;
            case 'SHOW':
                target.FLAG = 1;
                break;
            case 'THROW':
                target.FLAG = 2;
                break;
            case 'FLAG':
                return target.FLAG;
        }
        return `ERROR_OPTION: 异常抛出模式修改为 ${key} 模式!`;
    }
});

/**
 * 抛出一组异常
 * 使用 console.group 抛出
 *
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
};

// window.onerror
window.onerror = function(sMessage, sUrl, sLine) {
    let {FLAG} = ERROR_OPTION;
    if (FLAG === 1) {
        throwError(sMessage, [
            ['代码地址:', sUrl],
            ['错误行号:', sLine],
            ['更正建议:', analysisError(sMessage, sUrl, sLine)]
        ], 'info');
    }
    if (FLAG === 2) {
        return false;
    } else {
        return true;
    }
};

function analysisError(sMessage, sUrl, sLine) {
    let [rg1, rg2, rg3, rg4, rg5] = [];
    switch (true) {
        case !!(rg1 = /^Uncaught ReferenceError: (.*) is not defined$/.exec(sMessage)):
            let fnName1 = rg1[1];
            return `${fnName1}尚未定义!
            请在 ${sUrl} 文件${sLine}行左右的位置寻找 ${fnName1} 关键字
            并检查单词拼写, 和是否未定义`;

        case !!(rg2 = /^Uncaught TypeError: Cannot read property '(.*)' of (.*)$/.exec(sMessage)):
            let fnName2 = rg2[1];
            let fnPare2 = rg2[2];
            return `${fnPare2} 不能进行 .${fnName2}, 因为他没有定义${fnName2}属性或方法
            请在 ${sUrl} 文件${sLine}行左右的位置寻找 ${fnName2} 关键字
            检查${fnName2}的上级变量是否被赋值成了undefined!`;

        case !!(rg3 = /^Uncaught TypeError: (.*) is not a function$/.exec(sMessage)):
            let fnName3 = rg3[1].split('.');
            let fnName3Leng = fnName3.length;
            return `${fnName3[fnName3Leng - 1]} 不是 ${fnName3[fnName3Leng - 2]} 的方法(function)
            请在 ${sUrl} 文件${sLine}行左右的位置寻找 ${fnName3.join('.')} 关键字
            检查${fnName3[fnName3Leng - 1]}是否是${fnName3[fnName3Leng - 2]}的方法`;

        case sMessage === 'Uncaught TypeError: Assignment to constant variable':
            return `一个常量(const)被改变
            请在 ${sUrl} 文件${sLine}行左右的位置寻找,是否有常量(const)被修改`;

        case sMessage === 'Uncaught SyntaxError: Invalid shorthand property initializer':
            return `语法错误
            请在 ${sUrl} 文件${sLine}行左右的位置寻找
            是否存在类似{a=1,b=2}的写法错误`;

        case sMessage === 'Uncaught SyntaxError: Missing initializer in destructuring declaration':
            return `语法错误
            请在 ${sUrl} 文件${sLine}行左右的位置寻找
            是否存在类似var [a=1] 的写法错误`;

        case sMessage === 'Uncaught SyntaxError: Unexpected identifier':
            return `赋值错误
            请在 ${sUrl} 文件${sLine}行左右的位置寻找
            1.是否有赋值字符串类型数据的时候未加双引号
            2.是否使用了关键字(private等)`;

        case !!(rg4 = /^Uncaught SyntaxError: Unexpected token (.*)$/.exec(sMessage)):
            let fnName4 = rg4[1];
            return `语法错误, 错误的${fnName4}用法
            请在 ${sUrl} 文件${sLine}行左右的位置寻找关键字 ${fnName4}
            可能勿用了${fnName4}关键字, 也可能在()中进行了定义变量导致了错误!`;
        
        case !!(rg5 = /^Identifier '(.*)' has already been declared$/.exec(sMessage)):
            let fnName5 = rg5[1];
            return `${fnName5}在之前已经定义过了
            请在 ${sUrl} 文件${sLine}行左右的位置寻找关键字 ${fnName5}
            可能重复定义(let)了变量${fnName5}!`;

        default:
            return sMessage;
            break;
    }
};

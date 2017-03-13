// 非企业邮箱的黑名单
const emailBlackList = [
    '@gmail.com','@yahoo.com','@msn.com','@hotmail.com','@aol.com',
    '@ask.com','@live.com','@qq.com','@0355.net','@163.com',
    '@163.net','@263.net','@3721.net','@yeah.net','@googlemail.com',
    '@mail.com','@hotmail.com','@msn.com','@yahoo.com','@gmail.com',
    '@aim.com','@aol.com','@mail.com','@walla.com','@inbox.com',
    '@126.com','@163.com','@sina.com','@21cn.com','@sohu.com',
    '@yahoo.com.cn','@tom.com','@qq.com','@etang.com','@eyou.com',
    '@56.com','@x.cn','@chinaren.com','@sogou.com','@citiz.com',
    '@hongkong.com','@ctimail.com','@hknet.com','@netvigator.com','@mail.hk.com'
];

/**
 * 检查是否是邮箱
 * 返回true或false
 * @param {string} email
 */
function isEmail(email) {
    if (typeof email === 'string')
        return /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email);
    return false;
};

/**
 * 检查是否是手机号
 * @param {*} mobile 
 */
function isMobileFormat(mobile = '') {
    return /^(13\d{9}|14[57]\d{8}|15[^4]\d{8}|17[0678]\d{8}|18\d{9})$/.test(mobile);
};

/**
 * 检查邮箱是否是企业邮箱
 * @param {String} email 
 */
function isEmailBlackList(email) {
    if (typeof email === 'string' && isEmail(email)) {
        for (let i = 0, len = emailBlackList.length; i < len; i++) {
            var blackEmail = emailBlackList[i];
            var index = email.indexOf(blackEmail);
            if (index !== -1 && index === email.length - blackEmail.length) return false;
        }
        return true;
    }
    return false;
}

/**
 * 为一个元素绑定onsize事件
 * bindReSize 与 cancelReSize
 * @param {element} element
 * @param {Function} callback
 */
function bindReSize(element, callback) {
    var wResize = window.onresize;
    element.bindWidth = element.offsetWidth;
    element.bindHeight = element.offsetHeight;
    var resizeCallback = function resizeCallback(even) {
        if (element) {
            let contWidth = element.offsetWidth;
            let contHeight = element.offsetHeight;
            if (contWidth + contHeight === 0) {
                var isElement = element;
                var type = document.defaultView.getComputedStyle(isElement, null).display;
                while (type !== 'none') {
                    isElement = isElement.parentNode;
                    if (isElement === document) break;
                    type = document.defaultView.getComputedStyle(isElement, null).display;
                }
                return;
            }
            if (element.bindWidth !== contWidth || element.bindHeight !== contHeight) {
                element.bindWidth = contWidth;
                element.bindHeight = contHeight;
                callback.call(element, {
                    bubbles: false,
                    composed: false,
                    isTrusted: true,
                    cancelable: false,
                    returnValue: true,
                    cancelBubble: false,
                    defaultPrevented: false,
                    target: element,
                    srcElement: element,
                    currentTarget: element,
                    path: [window, element],
                    eventPhase: 2,
                    type: 'resize',
                    timeStamp: even.timeStamp
                });
            }
        }
    };
    window.addEventListener('resize', resizeCallback);
    return resizeCallback;
};

/**
 * 为一个元素解绑onsize事件
 * @param {Function} callback 
 */
function cancelReSize(callback) {
    window.removeEventListener('resize', callback);
};

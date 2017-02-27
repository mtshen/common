/*  request
    url:  {String} 发送请求的地址
    type: {String} 默认为get, 请求方式(post或get)
    timeout: {Number} 设置请求超时时间(毫秒)
    cache: {Boolean} 默认为true, 设置为false将不会从浏览器缓存中加载请求信息
    data: {object} 发送到服务器的数据
    dataType: {String} 预期服务器返回的数据类型.
        dom : 返回一个对象
        json：返回一个对象
        text：返回纯文本字符串
    contentType：{String} 当发送信息至服务器时,内容编码类型默认为"application/x-www-form-urlencoded".该默认值适合大多数应用场合.
    autoHide: {Boolean} 请求完毕后是否不等待其他代码,直接结束loading
    bind: {string|element} loading绑定的父元素
    loading: {Function} loading的html,或元素
    httpHeader : {object} 发送的http请求头, 以键值对的形式传入
    mosaic : {array} 如果发送的是get请求,mosaic参数将作为参数的模板,默认为 ['&', '=', '?']
    beforeSend：{Function} 发送请求前可以修改XMLHttpRequest对象的函数
    complete：{Function} 请求完成后调用的回调函数(请求成功或失败时均调用)
    success：{Function} 请求成功后调用的回调函数
    error: {Function} 请求失败时被调用的函数
*/
var request = (function() {

    // 全局设置,可以被更改
    var commonOption = {
        url: '',
        type: 'post',
        timeout: 0,
        cache: true,
        data: {},
        dataType: 'text',
        contentType: 'application/x-www-form-urlencoded',
        autoHide: true,
        bind: 'body',
        loading: '',
        httpHeader: {},
        mosaic: ['&', '=', '?'],
        beforeSend: function() { return true; },
        complete: function() { },
        success: function() { },
        error: function() { }
    };
    /**
     * 判断一个变量的类型,大多数类型都能判断
     * 返回的数据类型都是小写单词
     * 如果无法确认类型则返回字符串 'unknown'
     */
    var __is = function __is(content) {
        try {
            if (content === null) return null;
            if (typeof content !== 'object') return typeof content;
            if (content.nodeType) return 'domElement';
            if (
                typeof content === 'object' &&
                Object.prototype.toString.call(content) === '[object Array]'
            ) {
                return 'array';
            }
            if (
                content.length &&
                typeof content.length === 'number' &&
                content.length > -1
            ) {
                return 'likeArray';
            }
            if (typeof content === 'object') {
                return Object.prototype.toString
                    .call(content)
                    .replace(/\[object (\w+)\]/, '$1')
                    .toLowerCase();
            }
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    };
    /**
     * 合并2个option对象
     * 后者优先级高于前者
     */
    var __merge = function __merge(gOption = {}, option = {}) {
        var nOption = __copy(gOption);
        for (var k in option) {
            nOption[k] = option[k];
        }
        return nOption;
    };
    /**
     * 深度拷贝数据
     * 改变返回的数据不会对原始数据造成影响
     * 回调函数
     * 容易造成内存泄漏
     */
    var __copy = function __copy(data) {
        try {

            switch (__is(data)) {
                case 'array':
                    var arr = [];
                    for (var i = 0, j = data.length; i < j; i++) {
                        arr.push(__copy(data[i]));
                    }
                    return arr;
                case 'likeArray':
                case 'object':
                    var obj = {};
                    for (var k in data) {
                        obj[k] = __copy(data[k]);
                    }
                    return obj;
                default:
                    return data;
            }

            return data;

        } catch (error) {
            console.info(error);
        }
    };

    function getMergeUrl(url, mosaic, data) {
        let [mosaic0, mosaic1, mosaic2] = mosaic;
        let str = [mosaic2];
        for (var k in data) if (data.hasOwnProperty(k)) {
            str.push(k + mosaic1 + data[k]);
            str.push(mosaic0);
        }
        str.pop();
        return url += str.join('');
    };

    function setHttpHeader(request, headerObj) {
        for (var k in headerObj) if (headerObj.hasOwnProperty(k)) {
            request.setRequestHeader(k, headerObj[k]);
        }
    };

    function getLoadingMain(data) {
        switch (__is(data)) {
            case 'string':
                return Array.prototype.slice.call(document.querySelectorAll(data));
            case 'domElement':
                return [data];
            case 'likeArray':
            case 'array':
                return Array.prototype.slice.call(data);
        }

    };

    function getLoadingElement(data) {
        var str = data;
        switch (__is(data)) {
            case 'domElement':
                return data;
            case 'function':
                str = data();
            case 'string':
                var div = document.createElement('div');
                div.innerHTML = str;
                return div.childNodes[0];
        }
    }

    var requestBranch = {
        get: function(option) {
            // 得到option常用值
            var request = new XMLHttpRequest;

            // 加载loading
            var bind = getLoadingMain(option.bind);
            var loading = getLoadingElement(option.loading);
            if (loading && bind) {
                bind.forEach(function(v) {
                    var dom = loading.cloneNode(true);
                    dom.setAttribute('request-loadingElement', 'true');
                    v.appendChild(dom);
                });
            }

            // 拼接 get_url
            var url = getMergeUrl(option.url, option.mosaic, option.data);

            // 设置延时
            request.timeout = option.timeout;

            // 发送get请求
            request.open('get', url);

            // 设置内容编码
            request.setRequestHeader('Content-Type', option.contentType);

            // 设置是否缓存
            option.cache && request.setRequestHeader('If-Modified-Since', '0');

            // 设置请求头
            setHttpHeader(request, option.httpHeader);

            // 用户自定义
            option.beforeSend(request);

            request.send();

            var oldTimer = +new Date();

            var packingRequest = new PackingRequest(request, {
                option: option,
                startTime: oldTimer,
                trigger: request,
                bind: bind
            });

            request.ontimeout = function() {
                const newTimer = +new Date() - oldTimer;
                option.autoHide && packingRequest.hide();
                option.error.call(packingRequest, {
                    error: 'delayed',
                    target: request,
                    time: newTimer
                });
            };

            request.onreadystatechange = function(even) {
                requestCallback.call(this, even, option, {time: oldTimer, packingRequest: packingRequest});
            };

            return packingRequest;
        },
        post: function(option) {
            // 得到option常用值
            var request = new XMLHttpRequest;

            // 加载loading
            var bind = getLoadingMain(option.bind);
            var loading = getLoadingElement(option.loading);
            if (loading && bind) {
                bind.forEach(function(v) {
                    var dom = loading.cloneNode(true);
                    dom.setAttribute('request-loadingElement', 'true');
                    v.appendChild(dom);
                });
            }

            // 设置延时
            option.timeout && (request.timeout = option.timeout);

            // 发送post请求
            request.open('post', option.url);

            // 设置内容编码
            request.setRequestHeader('Content-Type', option.contentType);

            // 设置是否缓存
            option.cache && request.setRequestHeader('If-Modified-Since', '0');

            // 设置请求头
            setHttpHeader(request, option.httpHeader);

            // 用户自定义
            option.beforeSend(request);

            request.send(getMergeUrl('', option.mosaic, option.data).slice(1));

            var oldTimer = +new Date();

            var packingRequest = new PackingRequest(request, {
                option: option,
                startTime: oldTimer,
                trigger: request,
                bind: bind
            });

            request.ontimeout = function() {
                const newTimer = +new Date() - oldTimer;
                option.autoHide && packingRequest.hide();
                option.error.call(packingRequest, {
                    error: 'delayed',
                    target: request,
                    time: newTimer
                });
            };

            request.onreadystatechange = function(even) {
                requestCallback.call(this, even, option, {time: oldTimer, packingRequest: packingRequest});
            };

            return packingRequest;
        }
    };

    function requestCallback(even, option, conf) {
        var {autoHide, bind, hide} = option;

        if (this.readyState === 4) {
            option.autoHide && conf.packingRequest.hide();

            const newTimer = +new Date - conf.time;

            if (this.status === 200) {
                var data = requestParse(option.dataType, this.responseText);

                option.success.call(conf.packingRequest, data || this.responseText, {
                    target: request,
                    time: newTimer
                });
            } else if (this.status !== 0) {
                option.error.call(conf.packingRequest, {
                    target: request,
                    error: request.statusText,
                    time: newTimer
                });
            }

            option.complete.call(conf.packingRequest, {
                target: request,
                error: request.statusText,
                time: newTimer
            });
        }
    };

    function requestParse(type, data) {
        try {
            var requestParseReturn = data;

            switch (type) {
                case 'json':
                    (typeof data === 'string') && (requestParseReturn = JSON.parse(data));
                    break;
                case 'html':
                    if (typeof data === 'string') {
                        var box = document.createElement('request');
                        box.innerHTML = data;
                        requestParseReturn = box;
                    }
                case 'string':
                default:
                    break;
            }
            return requestParseReturn;
        } catch (error) {
            return false;
        }
    }

    function PackingRequest(request, option) {
        this.trigger = request;
        this._option = option;
        this.option = option.option;
        this.startTime = option.startTime;
    };

    PackingRequest.prototype.hide = function() {
        var bindArr = this._option.bind;
        bindArr.forEach(function(v) {
            var removeElement = Array.prototype.slice.call(v.querySelectorAll('[request-loadingElement=true]'));
            removeElement.forEach(function(n) {
                v.removeChild(n);
            });
        });
    };

    /**
     * 分支 - post, get, form 的切换
     */
    function branch(option) {
        var lawfulOption = __merge(commonOption, option);
        var branchFunction = requestBranch[lawfulOption.type];
        if (branchFunction) return branchFunction(lawfulOption);
        return false;
    };

    /**
     * 检查option是否合法
     */
    function main(option) {
        switch (__is(option)) {
            case 'object':
                return branch(option);
            default:
                return false;
        }
    };

    main.option = commonOption;

    return main;
})();

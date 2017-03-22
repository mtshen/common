/**
 * function add
 * @param {element} main 滚动容器
 * @param {Boolean} append 是否采用追加模式
 * @param {Boolean} default 默认是否进行一次加载
 * @param {String} url 请求地址
 * @param {Function} param 请求参数
 * @param {Function} callback 回调函数
 * @param {Function} success 返回成功的回调函数
 * @param {Function} error 返回失败的回调函数
 * @param {element} element 需要渲染的元素父级
 * @param {Number} reflex 在接近多少的时候开始触发
 * @param {String} flag 标记
 * @param {Object} data 用户的存储
 * @param {String} _html 当前数据 (私有的)
 */

define(function() {
    var data = [];
    /**
     * 获取数据
     * 获取真实的配置使用 getData(dom)[0].option
     *
     * 能够返回在data中存储的内容,
     * 这样做的好处是能够缓存数据到内存,而非dom的属性中
     * 能够减少很多风险
     *
     * @param {*} elem 相当于对象的键, 根据键找到对应的值
     */
    function getData(elem) {
        typeof elem === 'number' && (elem + '');
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].elem === elem) return [data[i], i];
        }
        return null;
    };

    /**
     * 存储数据与getData 配合使用
     *
     * @param {*} elem 键 可以是任意值
     * @param {Object} opt 值 存储的数据,一般推荐存储为对象,这样方便扩展
     */
    function setData(elem, opt) {
        typeof elem === 'number' && (elem + '');
        var _rtn = getData(elem);
        if (!_rtn) {
            data.push({
                elem: elem,
                option: opt
            });
        } else {
            data[_rtn[1]] = {
                elem: elem,
                option: opt
            };
        };
    };

    function removeData(index) {
        data.splice(index, 1);
    }
    /**
     * 初始化 配置项
     * 所有的配置项都要在此进行初始化,以确保其他函数能够接受到正规的配置项
     *
     * @param {Object} conf 配置项目列表
     */
    function initconfig(conf) {

        // 赋值操作!
        typeof conf.main === 'string' && (conf.main = document.querySelector(conf.main));
        typeof conf.element === 'string' && (conf.element = document.querySelector(conf.element));
        typeof conf.append === 'undefined' && (conf.append = true);
        typeof conf.default === 'undefined' && (conf.default = false);
        typeof conf.reflex === 'undefined' && (conf.reflex = 100);
        typeof conf.data === 'undefined' && (conf.data = {});
        typeof conf._html === 'undefined' && (conf._html = '');
        typeof conf.param === 'undefined' && (conf.param = function() { });
        typeof conf.success === 'undefined' && (conf.success = function() { });
        typeof conf.error === 'undefined' && (conf.error = function() { });
        typeof conf.callback === 'undefined' && (conf.callback = function() { });
        typeof conf.init === 'undefined' && (conf.init = function() { });
        typeof conf.postCheck === 'undefined' && (conf.postCheck = function() { return true; });

        conf.__postFlag = false;

        return conf;
    };

    /**
     * scroll事件函数
     * 单独提出的话可以通过 removeEventListener 来解除绑定
     */
    function elementScroll(force = {}) {
        var _this = this;
        var conf = getData(_this.getAttribute('watefall-flag'))[0].option;
        var index = getData(_this.getAttribute('watefall-flag'))[1];
        var {
            callback = conf.callback,
            data = conf.data,
            param = conf.param,
            url = conf.url,
            success = conf.success,
            error = conf.error,
            postCheck = conf.postCheck,
            element = conf.element,
            append = conf.append,
            init = conf.init
        } = force;

        if (force.force ||
            _this.scrollTop + _this.clientHeight - _this.scrollHeight + conf.reflex > -500 &&
            !conf.__postFlag) {

            conf.__postFlag = true;

            var postData = force.data || param(conf.data);
            request({
                url: url,
                data: postData,
                success: function(json) {

                    if (json.status === 1) {
                        var html = callback.call(conf, json, data);
                        var noS = false;
                        if (init && !init.call(conf, json, data)) {
                            removeData(index);
                            return false;
                        }

                        if (postCheck(json)) {
                            var _html = '';
                            _html = (append ? element.innerHTML + html : html);
                            if (append) {
                                var box = document.createElement('tbody');
                                box.innerHTML = html;
                                var boxs = Array.prototype.slice.call(box.children);
                                boxs.forEach(function(v) {
                                    element.appendChild(v);
                                });
                            } else {
                                conf._html = _html;
                            }
                        }

                        success.call(conf, data, json);

                    } else {
                        error.call(conf, data, json);
                    }

                    conf.__postFlag = false;
                }
            });
        };

    };

    /**
     * 鼠标滚轮事件函数
     * 主要用来解决没有滚动条的情况下进行更新数据
     */
    function elementMousewheel(e) {
        e = e || window.event;
        var direct;
        if (e.wheelDelta) { //IE/Opera/Chrome
            direct = e.wheelDelta > 0;
        } else if (e.detail) { //Firefox
            direct = e.wheelDelta > 0;
        }
        if (!direct && this.scrollHeight - this.clientHeight <= 0) {
            elementScroll.call(this, {force: true});
        }
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
    /**
     * 添加
     * 添加一个配置列表,根据配置列表内容自动生成瀑布流形式的文档
     *
     * @param {object} config 配置项 配置内容参考 最顶部的注释
     */
    function add(config) {
        var orgConfig = __copy(config);
        var conf = initconfig(config);
        var {main, flag} = conf;
        if (!main) return;
        main.setAttribute('watefall-flag', flag);
        // 1.注册事件
        main.addEventListener('scroll', elementScroll);
        main.addEventListener('mousewheel', elementMousewheel);
        main.addEventListener('DOMMouseScroll', elementMousewheel);
        conf.orgConfig = orgConfig;
        setData(flag, conf);
        // 2.触发事件
        conf.default && elementScroll.call(main, {force: true, init: conf.init});
    };

    /**
     * 检查
     * 检查一个标记是否存在
     * 是返回 true,
     * 否返回 false
     */
    var check = (flag) => !!getData(flag);

    /**
     * 停用一个 flag
     * {String element} elem 根据elem中的watefall-flag标记进行停用
     */
    function hide(elem) {
        typeof elem === 'string' && (elem = document.querySelector(elem));
        if (!elem) return;
        var oldFlag = elem.getAttribute('watefall-flag');
        if (oldFlag && getData(oldFlag)) {
            var oldOption = getData(oldFlag)[0].option;
            oldOption.main.removeEventListener('scroll', elementScroll);
            oldOption.main.removeEventListener('mousewheel', elementMousewheel);
            oldOption.main.removeEventListener('DOMMouseScroll', elementMousewheel);

            oldOption.main.removeAttribute('watefall-flag');
            oldOption._html = oldOption.element.innerHTML;
            oldOption.element.innerHTML = '';
        }
    };

    /**
      * 启用一个 flag
      * 如果 flag 对应的main参数被占用,则自动执行hide函数进行停用
      * {String Element} 根据elem中的watefall-flag标记进行启用
      */
    function show(flag) {
        var newOption = getData(flag)[0].option;

        // 如果该main被占用,则自动解除占用
        newOption.main.getAttribute('watefall-flag') && hide(newOption.main);
        newOption.main.setAttribute('watefall-flag', flag);
        newOption.main.addEventListener('scroll', elementScroll);
        newOption.main.addEventListener('mousewheel', elementMousewheel);
        newOption.main.addEventListener('DOMMouseScroll', elementMousewheel);
        // html 赋值操作
        newOption.element.innerHTML = newOption._html;
    }

    /**
     * 一些对外公开数据的函数
     * gGetData 得到用户存储的data
     * g_cacheHtml 能够存储目前缓存的html
     * g_debug 能够对全局data进行调试,绑定到一个对象中
     * g_html 能够获取目前缓存的html
     */
    var gGetData = (flag) => (getData(flag) && getData(flag)[0].option.data);
    var gCacheHtml = (flag, html) => (getData(flag) && (getData(flag)[0].option._html = html));
    var gDebug = (flag) => (flag.debug = data);
    var gHtml = (flag) => getData(flag)[0].option._html;
    var triggerPost = (flag, option) => {
        elementScroll.call(flag, option);
    };

    // 清除掉一个id的缓存数据, 所有的
    function remove(flag) {
        var _data = getData(flag);
        if (_data) {
            var index = getData(flag)[1];
            data.splice(index, 1);
        }
    };

    function init(flag) {
        var _data = getData(flag);
        if (_data) {
            var index = getData(flag)[1];
            var removeData = getData(flag)[0];
            data.splice(index, 1);
            add(removeData.option.orgConfig);
        }
    }

    var _external = (flag) => (window.waterfall = {
        add: add,
        check: check,
        show: show,
        hide: hide,
        getData: gGetData,
        cacheHtml: gCacheHtml,
        debug: gDebug,
        html: gHtml,
        post: triggerPost,
        remove: remove,
        init: init
    });

    return {
        add: add,
        check: check,
        show: show,
        hide: hide,
        getData: gGetData,
        cacheHtml: gCacheHtml,
        external: _external,
        debug: gDebug,
        html: gHtml,
        remove: remove,
        init: init
    };
});

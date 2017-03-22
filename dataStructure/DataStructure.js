/**
 * 为数据结构提供的接口,全局参数
 * 
 * 利用数据结构提供的接口可以实现数据的单向绑定, 即变量改变,界面随之改变
 * 在数据结构内存储的数据,不会暴露在外部,只能通过接口来改变内部数据
 * 
 * ---------------------------------------------------------------------
 * option 配置
 * repeat           是否去重, 默认为true, 如果该参数为true 那么g参数则为false
 * key              作为 搜索的key 不设置key,无法进行去重
 * weakCheck        是否深度匹配 (在对比2个对象或数组时,是否要保证数据的一致性) 默认为 true [如果对比将消耗相当的内存]
 * callback         内容被修改之后的回掉函数, 修改之前不会产生回调
 * intercept        在数据修改/加入之前的回调函数, 如果返回false, 则不会加入, 可以修改传入的data
 * cover            如果出现重复的值是否覆盖
 * g                是否作为全局匹配,如果为false只匹配第一个成功匹配的值
 * ---------------------------------------------------------------------
 * 
 * @class: DataStructure
 * @example:
 *      var dimension = DataStructure('column', false);
 *      var dimension = DataStructure('column', {repeat: false});
 *      var dimension = DataStructure({
 *                           key: "column",
 *                           repeat: false
 *                      });
 * @throws: 最好存入一个对象,不然可能做一些操作时,会产生报错
 *          大数据的深度匹配可能造成内存溢出
 * TODO : 换位操作
 */
var DataStructure = (function () {
    var DATA = {},
        DATA_LENGTH = 0;

    /**
     * 判断一个变量的类型,大多数类型都能判断
     * 返回的数据类型都是小写单词
     * 如果无法确认类型则返回字符串 'unknown'
     */
    var __is = function __is(content) {
        try {
            if (content === null) return null;
            if (typeof content !== "object") return typeof content;
            if (content.nodeType) return "domElement";
            if (typeof content === "object" & Object.prototype.toString.call(content) === "[object Array]") return "array";
            if (content.length & typeof content.length === "number" & content.length > -1) return "likeArray";
            if (typeof content === "object") return Object.prototype.toString.call(content).replace(/\[object (\w+)\]/, "$1").toLowerCase();
            return "unknown";
        } catch (e) {
            return "unknown";
        }
    };

    /**
     * 初始化参数
     */
    var __initOption = function __initOption(option = {}) {
        if (option.repeat === undefined) option.repeat = true;
        if (option.weakCheck === undefined) option.weakCheck = true;
        if (option.cover === undefined) option.cover = true;
        return option;
    };

    /**
     * 深度匹配2个参数是否相等
     * 是一个回调函数,在对比的时候可能会造成内存溢出
     * 小心使用
     */
    var __contrast = function __contrast(o_data, n_data) {
        switch (__is(o_data)) {
            case !__is(n_data):
                return false;
            case 'array':
            case 'likeArray':
                if (o_data.length !== n_data.length) return false;
                for (let i = 0, ii = o_data.length; i < ii; i++) {
                    if (!__contrast(o_data[i], n_data[i])) return false;
                }
                break;
            case 'object':
                for (let k in o_data) {
                    if (!__contrast(o_data[k], n_data[k])) return false;
                }
                for (let k in n_data) {
                    if (!__contrast(o_data[k], n_data[k])) return false;
                }
                break;
            case 'regexp':
                return o_data.toString() === n_data.toString();
            case 'date':
                return o_data - n_data === 0;
            default:
                return o_data === n_data;
        }
    };

    /**
     * 合并2个option对象
     * 后者优先级高于前者
     */
    var __merge = function __merge(g_option = {}, option = {}) {
        var n_option = __copy(g_option);
        for (var k in option) {
            n_option[k] = option[k];
        }
        return n_option;
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
     * 生产一个唯一的ID标识作为DataStructure类库的flagName
     */
    var __initFlag = () =>
        '$$__DataStructure__' + (+new Date) + '__' + (++DATA_LENGTH);

    /**
     * 根据标识获取对象的值
     */
    var __getdatas = (flagName, key) =>
        key ? DATA[flagName][key] : DATA[flagName];


    /**
     * 类库 DataStructure 数据结构
     */
    class DataStructure {
        /**
         * 类库 DataStructure 数据结构的入口
         * @param option_key { object | string } 传入key参数 或者 option配置项
         * @param option_repeat { object | boolean } 传入repeat参数 或者 option配置项
         */
        constructor(option_key, option_repeat) {
            var __option;

            // 初始化
            const flagName = __initFlag();
            this.__flagName = flagName;
            this.length = 0;

            // 使 flagName 可读,不可写
            Object.defineProperty(this, '__flagName', { writable: false, enumerable: false, configurable: false });

            // 为总分支创建资源
            DATA[flagName] = {
                data: [],
                cache: [],
                raw: []
            };

            // 灵活的传值方式
            switch (__is(option_key)) {
                case 'object':
                    __option = __initOption(option_key);
                    break;
                case 'string':
                    __option = __initOption({
                        key: option_key,
                        repeat: option_repeat
                    });
                    break;
                default:
                    __option = __initOption({});
                    break;
            }

            // 如果配置项错误则创建失败
            if (__option) {
                this.option = __option;
            } else {
                return null;
            }
        };

        /**
         * 存储数据
         * @param data { object | * } 需要存储的某个数据,最好是个对象类型参数,否则获取上数据时key可能出错
         * @param n_option { object } 更改配置项,仅在本次操作生效
         */
        set(data, n_option = {}) {
            const option = __merge(this.option, n_option);
            var { key, weakCheck, callback, cover, intercept} = option;
            var t_data = __getdatas(this.__flagName, 'data');
            var opt, sendData;

            // 不去重或没有设置key
            if (!key || !option.repeat || !t_data.length || !cover) {

                // 如果callback 返回值为false 将不会进行push操作
                opt = {
                    index: t_data.length,
                    target: data,
                    data: data,
                    array: t_data,
                    option: option,
                    type: 'push'
                };
                sendData = intercept ? data : intercept.call(this, data, __copy(opt));
                if (sendData) {
                    t_data.push(sendData);
                    opt.data = sendData;
                    opt.target = sendData;
                    callback && callback.call(this, __copy(opt));
                }

                this.length = t_data.length;
                return this;
            }

            // 去重操作
            for (let i = 0, ii = t_data.length; i < ii; i++) {
                let [o_data, n_data] = [t_data[i][key], data[key]];
                let flag = weakCheck ?
                    __contrast(o_data, n_data) :
                    o_data === n_data;

                // 去重操作,覆盖
                if (flag) {
                    opt = {
                        index: i,
                        target: o_data,
                        data: data,
                        array: t_data,
                        option: option,
                        type: 'cover'
                    };
                    sendData = intercept ? data : intercept.call(this, data, __copy(opt));
                    if (sendData) {
                        t_data[i] = sendData;
                        opt.data = sendData;
                        callback && callback.call(this, __copy(opt));
                    }

                    this.length = t_data.length;
                    return this;
                }

            }

            // 没有重复
            opt = {
                index: t_data.length,
                target: data,
                data: data,
                array: t_data,
                option: option,
                type: 'push'
            };
            sendData = intercept ? data : intercept.call(this, data, __copy(opt));
            if (sendData) {
                t_data.push(sendData);
                opt.data = sendData;
                opt.target = sendData;
                callback && callback.call(this, __copy(opt));
            }

            this.length = t_data.length;
            return this;
        };

        /**
         * 获取数据
         * @param data { * } 需要获取的参数key中的内容,如果是文本允许使用正则表达式
         * @param n_option { object } 更改配置项,仅在本次操作生效
         */
        get(data, n_option = {}) {
            const option = __merge(this.option, n_option);
            if (!option.g) option.g = !option.repeat;
            var { key, g, weakCheck } = option;
            var t_data = __getdatas(this.__flagName, 'data');
            var dataType = __is(data);
            var rtnArr = [];

            if (data !== undefined) {

                for (let i = 0, ii = t_data.length; i < ii; i++) {
                    let selfData = t_data[i];
                    let flag = false;

                    if (dataType !== 'regexp') {
                        flag = weakCheck ?
                            __contrast(selfData[key], data) :
                            selfData[key] === data;
                    } else {
                        // 正则匹配查询
                        flag = data.test(selfData[key])
                    }

                    // 查询结果存储
                    if (flag) {
                        if (g) {
                            rtnArr.push(selfData)
                        } else {
                            return selfData;
                        }
                    }

                }

            } else {
                rtnArr = t_data;
            }
            return __copy(rtnArr);
        };

        /**
         * 获取某个key值的位置
         * @param data { * } 需要获取的参数key中的内容
         * @param n_option { object } 更改配置项,仅在本次操作生效
         */
        indexOf(data, n_option = {}) {
            const option = __merge(this.option, n_option);
            var t_data = __getdatas(this.__flagName, 'data');
            var {key, g, weakCheck} = option;

            for (let i = 0, ii = t_data.length; i < ii; i++) {
                var data_i = t_data[i];
                if (g) {

                    if (__contrast(data_i, data)) return i;

                } else {

                    if (weakCheck) {

                        if (__contrast(data_i[key], data)) return i;

                    } else {

                        if (data_i[key] === data) return i;

                    }

                }
            }
            return -1;

        };

        /**
         * 检查值是否存在
         * 使用indexof 检查机制
         * @param data { * } 需要检查的参数中 key 中的内容
         * @param n_option { object } 更改配置项,仅在本次操作生效
         */
        has(data, n_option) {
            return this.indexOf(data, n_option) > -1;
        };

        /**
         * 删除key值所在的位置
         * @param data { * } 需要得到参数中 key 中的内容
         * @param n_option { object } 更改配置项,仅在本次操作生效
         */
        clear(data, n_option = {}) {
            // 删除操作
            // 如果没有值则视为清空操作
            const option = __merge(this.option, n_option);
            var t_data = __getdatas(this.__flagName, 'data');
            var {key, weakCheck, callback, cover, g, intercept} = option;
            var opt, removeFlag;

            if (data === undefined) {
                opt = {
                    index: 0,
                    target: null,
                    data: null,
                    array: [],
                    option: option,
                    type: 'clearAll'
                };

                removeFlag = intercept ? intercept.call(this, data, __copy(opt)) : true;
                if (removeFlag === undefined) {
                    DATA[this.__flagName].data = [];
                    callback && callback.call(this, __copy(opt));
                    this.length = 0;
                    return true;
                }

            }
            if (removeFlag && __is(removeFlag) !== 'array') {
                removeFlag = [removeFlag];
            }

            t_data = removeFlag || t_data;

            opt = {
                index: undefined,
                target: null,
                data: null,
                array: t_data,
                option: option,
                type: 'clear'
            };

            let i = 0;
            // 如果有值,且g = true 则删除所有匹配内容,如果g = false 则删除第一个匹配的内容
            while (i < t_data.length) {

                let o_data = t_data[i][key];
                let n_data = data;
                let flag = weakCheck ?
                    __contrast(o_data, n_data) :
                    o_data === n_data;

                if (flag) {
                    var optData = t_data[i];
                    var flag = intercept ? intercept.call(this, optData, __copy(opt)) : true;
                    if (flag) {
                        opt.data = t_data.splice(i, 1);
                        callback && callback.call(this, __copy(opt));
                    }
                    if (!g) break;
                } else {
                    i++;
                }

            }
            this.length = t_data.length;
            return this;
        };

        /**
         * 使2个值交换位置
         * exchange有专有的回调函数 exchangeCallback
         */
        exchange(changeA, changeB) {
            var t_data = __getdatas(this.__flagName, 'data');
            var oldData = __copy(t_data);
            var changeAIndex = this.indexOf(changeA);
            var changeBIndex = this.indexOf(changeB);
            var changeAData = __copy(t_data[changeAIndex]);
            var changeBData = __copy(t_data[changeBIndex]);

            if (changeAData && changeBData) {
                [t_data[changeAIndex], t_data[changeBIndex]] =
                    [t_data[changeBIndex], t_data[changeAIndex]];
                var exchangeCallback = this.option.exchangeCallback;
                exchangeCallback && exchangeCallback({
                    changeA: changeAData,
                    changeB: changeAData,
                    changeAIndex: changeAIndex,
                    changeBIndex: changeBIndex,
                    changeArray: oldData,
                    newArray: __copy(t_data)
                });
            }
            return this;
        };

        /**
         * proto
         * 
         * 对存入的数据进行Array操作, 可以直接调用Array的方法
         * 修改后的值会对应调用callback(push, cover, clear), exchangeCallback 等回调函数,
         * 但并不会调用 intercept 回调函数
         *
         * @param {functionName} 调用的array方法名称
         * @param {applyList} 调用参数列表
         * @param {n_option} option列表
         */
        proto(functionName, applyList, n_option = {}) {
            const option = __merge(this.option, n_option);
            var oldData = __getdatas(this.__flagName, 'data');
            var newData = __copy(oldData);
            oldData.forEach(function (v, i) {
                Object.defineProperty(v, "$$protoFlag", {
                    "value": `${i}`,
                    enumerable: false,
                    writeable: false,
                    configurable: true
                })
            });
            newData.forEach(function (v, i) {
                Object.defineProperty(v, "$$protoFlag", {
                    "value": `${i}`,
                    enumerable: false,
                    writeable: false,
                    configurable: true
                })
            });
            var protoReturn = Array.prototype[functionName].apply(newData, applyList);
            var index = 0;
            var errorInfo = 0;
            while (index < oldData.length) {
                var oldDatai = oldData[index];
                var newDatai = newData[index];
                if (oldDatai.$$protoFlag) {
                    if (oldDatai.$$protoFlag === newDatai.$$protoFlag) {
                        var changFlag = __contrast(oldDatai, newDatai);
                        if (changFlag) {
                            index++;
                        } else {

                        }
                    } else {

                    }
                } else {
                    // push 操作
                    oldData.splice(index, 2, newDatai, oldDatai);
                    errorInfo++;
                }

                if(errorInfo == 2){
                    console.info('DataStructure -> proto: ERROR!');
                    break;                    
                }
            }


            /**
             * 循环遍历旧数组, 并检查新数组
             * 出现以下情况 , 停止遍历
             * 1. 如果新数组中存在旧数组的index 且与 新数组与旧数组都存在index 则认定为 exchange 操作
             * 2. 如果新数组中存在旧数组的index 且 新数对应旧数组的位置不存在index, 则认定为 push 操作
             * 3. 如果新数组中不存在旧数组的index 则 认定为 remove 操作
             * 4. 如果新数组与旧数组的index相同内容却不同 则 认定为 cover 操作
             * 5. 
             * 如果都不是, 则继续遍历
             * 出现 - 停止遍历后会自动调用命令,并更正旧数组内容,更正后从停止遍历的位置开始遍历
             * 如果还是不同则抛出异常, 以防止死循环发生
             * 旧数组遍历完成后, 新数组从旧数组停止遍历的地方开始遍历, 没有index的都认定为 push 操作
             */




            var { key, weakCheck, callback, cover, intercept} = option;
            var opt;

            opt = {
                index: t_data.length,
                target: null,
                data: null,
                array: newData,
                option: option,
                type: 'push'
            };

            return protoReturn;
        };

        /**
         * 修改配置项
         * 如果要删除,为配置项赋值undefined,否则未修改的原配置项将继续保留
         * @param option { object } 需要修改的配置项
         */
        setOption(option) {
            if (!option) return false;
            this.option = __initOption(__merge(this.option, option));
            return true;
        };
    }

DataStructure.debug = () => DATA;

return DataStructure;
})()

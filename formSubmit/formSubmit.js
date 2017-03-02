/**
 * 获取所有的表单信息
 * option中可以设置以下选项
 * nameFlag: 获取key的属性 默认为name
 * value: 默认获取其中的html, input,textarea,select 默认取value值, 支持传入一个属性名称或者functionName
 * parent: 层级, 默认为form-parent
 * main: 本级name 默认为form-name
 * type: 类型, 支持string,number,boolean,int,float 父级支持 array, object
 * 最后会返回一个包含所有内容的键值对
 */
function form(dom, option={}) {
    var {
            nameFlag='form-name',
            parent='form-parent',
            main='form-main',
            type='form-type',
            value
        } = option;
    var _main = arguments[3] ? `[${parent}=${arguments[3]}]` : `[${parent}=${dom.getAttribute(main)}]`;
    var data = arguments[2] ||
            (dom.getAttribute(type) === 'array' ? [] : {});
    var eachFn = undefined;
    var domlist = Array.prototype.slice.call(dom.querySelectorAll(`[${nameFlag}]${_main}`));
    // domlist第一次获取到没有父级, 也就是顶级表单信息, 第二次获取父级为某个表单的信息并插入到其下
    switch (typeof value){
        case 'string':
            eachFn = (dom) => dom.getAttribute(value);
            break;
        case 'function':
            eachFn = (dom) => value(dom);
            break;
        default:
            eachFn = (dom) => 
                    dom[(['input', 'textarea', 'select'].indexOf(dom.nodeName.toLowerCase())
                    > -1 ? 'value' : 'innerHTML')];
            break;
    }

    if (!eachFn)
        return false;

    domlist && domlist.forEach(function(v) {
        var key = v.getAttribute(nameFlag);
        var dataType = v.getAttribute(type);
        if(v.hasAttribute(main)){
            data[key] = (dataType === 'array'? [] : {});
            getData(dom, option, data[key], v.getAttribute(main));
        } else {
            var vData = eachFn(v);
            switch(v.getAttribute(type)){
                case 'string':
                    vData += '';
                    break;
                case 'number':
                    vData = Number(vData);
                    break;
                case 'int':
                    vData = parseInt(vData);
                    break;
                case 'float':
                    vData = parseFloat(vData);
                    break;
                case 'boolean':
                    vData = !!vData;
                    break;
            }
            if(data.length !== undefined){
                data.push(vData);
            } else {
                data[key] =  vData;
            }
        }
    });
    return data;
};

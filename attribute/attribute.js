// 设置属性增强库
var attr = (function() {
    let attrData = [];
    let intFlag = 0;
    
    // 几个API
    let getAttrFlag = () => intFlag ++;
    let isAttrFlag = (dom) => dom && dom.hasAttribute('attr-id');
    let setAttrFlag = (dom) => (isAttrFlag(dom) || dom.setAttribute('attr-id', getAttrFlag()));
    let hasAttrData = (id) => !!getAttrData(id);

    // 获取attrData
    function getAttrData(id) {
        for (let i = attrData.length - 1, j = 0; i >= j; i --) {
            let data = attrData[i];
            if (data.id == id) return data;
        }
        return null;
    };

    function setAttrData(id, attrName, _attrData) {
        var data = getAttrData(id);
        if (data) {
            data.attribute[attrName] = _attrData;
        } else {
            var newData = {id: id, attribute: {}};
            newData.attribute[attrName] = _attrData;
            attrData.push(newData);    
        }
    };

    function setAttr(attrName, attrData) {
        let dom = this.element;
        setAttrFlag(dom);
        let attrId = dom.getAttribute('attr-id');
        setAttrData(attrId, attrName, attrData);
    };

    function getAttr(attrName) {
        let dom = this.element;
        let attrId = dom.getAttribute('attr-id');
        let rtnData = getAttrData(attrId);
        if (rtnData) {
            rtnData = rtnData.attribute
        } else {
            return null;
        }
        attrName && (rtnData = rtnData[attrName]);
        return rtnData;
    };

    function hasAttr(attrName) {
        return !!getAttrData(this.element.getAttribute('attr-id'));
    };

    return function (element) {
        return {
            element: element,
            set: setAttr,
            get: getAttr,
            has: hasAttr
        };
    };
})();
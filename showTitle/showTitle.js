var showTitle = (function() {
    document.body.addEventListener('mouseover', showTitle);
    document.body.addEventListener('mouseout', hideTitle);

    function getScrollTops(dom) {
        return document.body.scrollTop;
        // var num = dom.scrollTop;
        // var par = dom.parentNode;
        // while(par !== document) {
        //     num += par.scrollTop;
        //     par = par.parentNode;
        // }
        // return num;
    }
    var getHtml = (option) => `
        <div class="showEllipsis" style="top: ${option.top}px; left: ${option.left}px">
        <div class="after" style="left: ${option.after}"></div><div class="content">${option.content}</div></div>`;

    function getElement(html) {
        var box = document.createElement('div');
        box.innerHTML = html;
        return box.children[0];
    };

    function gasShowTitleLength(dom) {
        var text = dom.innerHTML;
        text = text.replace(/^\s*/, '').replace(/\s*$/, '');
        var textData = document.defaultView.getComputedStyle(dom);
        var w1 = textLength(text, {
            size: textData.fontSize,
            spacing: textData.wordSpacing,
            indent: textData.textIndent,
            family: textData.fontFamily
        });
        return w1;
    };

    function hasShowTitle(dom) {
        var w1 = gasShowTitleLength(dom);
        var w2 = dom.offsetWidth;
        return (w1 - w2 > 0);
    };

    function isdropDown(dom) {
        var dropDown = dom;
        while (dropDown && dropDown.hasAttribute && !dropDown.hasAttribute('menu')) {
            dropDown = dropDown.parentNode;
        }
        if (!dropDown || dropDown === document) return false;
        var flag = dropDown.getAttribute('ellipsis-find');
        return flag && dropDown.querySelector(flag);
    };

    function showTitle(even) {
        even = even || window.event;
        var _this = even.target;
        var isShowEllipsis = _this.hasAttribute('showEllipsis');
        var showEllipsisText = _this.getAttribute('showEllipsis');

        if (isdropDown(_this)) {
            return true;
        };

        if (isShowEllipsis && showEllipsisText) {

            var textData = document.defaultView.getComputedStyle(_this);
            var w1 = textLength(showEllipsisText, {
                size: '12px'
            });
            var zb = _this.getBoundingClientRect();
            var box = getElement(getHtml({
                content: showEllipsisText,
                left: zb.left - (w1 / 2) + (_this.offsetWidth / 2),
                top: zb.top + _this.offsetHeight + getScrollTops(_this),
                after: '50%'
            }));
            document.body.appendChild(box);
        } else if (isShowEllipsis && hasShowTitle(_this)) {
            var zb = _this.getBoundingClientRect();
            var box = getElement(getHtml({
                content: _this.innerHTML,
                left: zb.left,
                top: zb.top + _this.offsetHeight - 5,
                after: (_this.offsetWidth / 2) + 'px'
            }));
            document.body.appendChild(box);
        }
    };

    function hideTitle(even) {
        even = even || window.event;
        if (even.target.hasAttribute('showEllipsis')) {
            var showEllipsisDom = document.querySelector('.showEllipsis');
            showEllipsisDom && document.body.removeChild(document.querySelector('.showEllipsis'));
        }
    };

    function textLength(text, option = {}) {
        var checkBox = document.createElement('span');
        var {size, spacing, indent, family} = option;

        checkBox.innerHTML = text;
        size && (checkBox.style.fontSize = size);
        spacing && (checkBox.style.wordSpacing = spacing);
        indent && (checkBox.style.textIndent = indent);
        family && (checkBox.style.fontFamily = family);

        document.body.appendChild(checkBox);
        var width = checkBox.offsetWidth;
        document.body.removeChild(checkBox);
        return width;
    }

    return {
        off: function() {
            document.body.removeEventListener('mouseover', showTitle);
            document.body.removeEventListener('mouseout', hideTitle);
        },
        on: function() {
            document.body.addEventListener('mouseover', showTitle);
            document.body.addEventListener('mouseout', hideTitle);
        }
    };
})();

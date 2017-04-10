let Template = (function() {
    let TemplateVariable = /<% *= *(.*)%>/g;
    let TemplateOther = /<% *(.*)%>/g;
    let TemplateInfo = () => '';

    function Template(templateString) {

        if (typeof templateString !== 'string') {
            console.info('Template: templateString Not for', typeof templateString);
            return TemplateInfo;
        }

        let tplStr = templateString
                .replace(/[\r\n]/g, '')
                .replace(/}}/g, '}}\r\n')
                .replace(TemplateVariable, '");a($1);a("')
                .replace(TemplateOther, '");$1 a("');

        tplStr = `a(${tplStr});`;
        let tplfunctioncont = `(function p(self){var t=[];function a(v){t.push(v)};${tplStr}return t.join("");});`;
        try {
            return eval.call(null, tplfunctioncont);
        } catch (error) {
            console.info('Template: ', tplfunctioncont, error);
            return TemplateInfo;
        }
    };

    return (s) => Template(s);
})();
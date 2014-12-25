var tagFilter = require("../plugins/tagFilter.js");
var pregQuote = require("../plugins/pregQuote.js");

var smarty_left_delimiter;
var smarty_right_delimiter;

function setDelimiter() {
    smarty_left_delimiter = fis.config.get("settings.smarty.left_delimiter") || "{";
    smarty_right_delimiter = fis.config.get("settings.smarty.right_delimiter") || "}";
}

function widgetWrapper(content, file) {
	setDelimiter();
    
    var hasFunctionTag = false;
    content = tagFilter.filterBlock(content, 'function', smarty_left_delimiter, smarty_right_delimiter,
        function(outter, attr, inner, content) {
            hasFunctionTag = true;

            return outter;
        }
    );

    if (!hasFunctionTag && file.subdirname.split('/')[1] === 'widget' || file.extras.isFispWidget) {
        //console.log(content);
        content = smarty_left_delimiter +
            "define" +
            smarty_right_delimiter + '\n' +
            content + '\n' +
            smarty_left_delimiter +
            "/define" +
            smarty_right_delimiter;
    }
    return content;
}

function replaceAttr(content, file, tagName, attrName, replaceAttrName) {
    setDelimiter();

    var attrReg = new RegExp("((?:^|\\s)" +
        pregQuote(attrName) +
        "\\s*=\\s*)(([\"\']).*?\\3)", "ig");

    content = tagFilter.filterTag(content,
        tagName, smarty_left_delimiter, smarty_right_delimiter,
        function(outter, attr) {

            attr = attr.replace(
                attrReg,
                function(all, preCodeHolder, valueCodeHolder) {
                    return preCodeHolder.replace(attrName, replaceAttrName) + valueCodeHolder;
                });

            outter = smarty_left_delimiter +
                tagName + attr +
                smarty_right_delimiter;
            //console.log(outter, attr);
            return outter;
        });

    return content;
}

function fispAdaptor(content, file) {
    content = replaceAttr(content, file, 'html', 'framework', 'her');
    content = widgetWrapper(content, file);

    return content;
}

module.exports = fispAdaptor;

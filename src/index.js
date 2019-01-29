const {createFilter} = require('rollup-pluginutils')

module.exports = function tpl (options = {}) {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'tpl',
    transform (tpl, id) {
      if (id.slice(-4) !== '.tpl') return null;
      if (!filter(id)) return null;
      const content = transformTpl(tpl)
      return {code: `export default ${content};\n`, map: {mappings: ''}};
    }
  };
}
function transformTpl(content) {
  if(typeof content !== 'string') {
    try {
      content = content.toString();
    } catch (e) {
      throw new Error('file type is error!');
    }
  }
  let fn = new Function('self', "self=self||{};var p=[];p.push('" + content.replace(/[\r\t\n]/g, " ")
    .split("<%")
    .join("\t")
    .replace(eval("/((^|%>)[^\\t]*)'/g"), "$1\r")
    .replace(eval("/\\t=(.*?)%>/g"), "',$1,'")
    .split("\t")
    .join("');")
    .split("%>")
    .join("p.push('")
    .split("\r")
    .join("\\'") + "');return p.join('');");
  return fn.toString();
}

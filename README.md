her-preprocessor-fispadaptor

一个兼容fisp项目的插件

============================
##使用方法##
###1.安装插件###
```
npm install her-preprocessor-fispadaptor -g
```
###2.配置fis-conf###
```
fis.config.get('modules.preprocessor.tpl').unshift('fispadaptor')
```

##FISP模块迁移文档##

###1.替换smarty运行时插件###

下载最新的[Her smarty运行时插件](http://gitlab.baidu.com/hao123-fe/her-smarty-plugin/tree/master)

复制plugin目录下所有文件到原fisp的plugin目录，并删除fisp同名的编译插件compiler.require.php、compiler.script.php、compiler.widget.php

注意：
`{html}`插件会根据是否quickling请求决定是否输出DOCTYPE
```html
<!DOCTYPE html>
```
所以不需要在模板中输出DOCTYPE，需要删除模板中直接输出的DOCTYPE。

###2.替换前端运行时框架###

前端运行时框架在static目录，其中bigpipe.js和amd.js是框架运行必须的代码，需要在`{html}`标签初始化，可以用inline的方式引入，例如：

```smarty
{strip}
{html framework="common:static/lib.js" lang="zh-cn"}
{head}
```
注意：
为了性能优化，Her前端运行时根据资源的依赖关系使用loader异步加载资源，默认只有框架js和`{pagelet}`外依赖的css是同步输出到页面的。

所以对于公用的库（例如jquery），建议用依赖管理的方式使用，即使用jquery的时候都要声明依赖：
```javascript
require('common:static/jquery.js');
// then use $ or jQuery as global namespace

// or
var $ = require('common:static/jquery.js');
// then use $ as local variable (recommend)
```

如果不想每次使用jquery的时候都声明依赖，可以把jquery inline到lib.js中，这样jquery会同步加载，之后的js都可以直接使用`$` or `jQuery`全局变量。但是从性能优化的角度，不建议这样做。

###3.安装预处理插件和配置fis-conf###
按上面的使用方法安装her-preprocessor-fispadaptor和配置fis-conf。

###4.用her release命令发布模块###
运行
```
$ her release -c
```
发布模块。至此你的模块已经可以run起来，你可以继续按下面的步骤就行性能优化。

###5.性能优化###




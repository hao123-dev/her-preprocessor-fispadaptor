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

下载最新的[Her smarty运行时插件](https://github.com/hao123-fe/her-runtime/tree/master/dist)

其中plugin目录是smarty运行时插件，javascript目录是前端amd和bigpipe运行时，js_helper是一些有用的业务代码实现(例如bigRender.js)

复制plugin目录下所有文件到原fisp的plugin目录，并删除fisp同名的编译插件compiler.require.php、compiler.script.php、compiler.widget.php

注意：
`{html}`插件会根据是否quickling请求决定是否输出DOCTYPE
```html
<!DOCTYPE html>
```
所以不需要在模板中输出DOCTYPE，需要删除模板中直接输出的DOCTYPE。

###2.替换前端运行时框架###

前端运行时框架在javascript目录，main.js是框架运行必须的代码，需要在`{html}`标签初始化，例如：
```smarty
// in tpl
{strip}
{html framework="path/to/main.js" lang="zh-cn"}
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
发布模块。至此你的模块已经可以run起来，你可以继续按下面的步骤进行性能优化。
注意：
`{script}`标签内的js执行是在包含它的pagelet load之后，所以不能在`{script}`使用`documet.write()`，如果一定要使用`documet.write()`，在`{pagelet}`外可以直接写`<script>`标签。`{pagelet}`中的内容都不是同步输出的，不能使用`documet.write()`。


###5.性能优化###

####5.1使用`{pagelet}`将页面分块（[wiki](https://github.com/hao123-fe/her/wiki/02-01.Smarty%E6%A8%A1%E6%9D%BF)）####

`{pagelet}`将页面分块，并收集其中的html、css、js。`{pagelet}`中的内容都通过js渲染。建议将非首屏内容都添加`{pagelet}`，异步渲染。

####5.2 非首屏内容使用bigrender####
在pagelet加载之前用js阻止，并在需要的时候手动调用pagelet.load()加载pagelet，即可实现bigrender。

依赖bigRender.js、lazy.js和jquery
```smarty
{pagelet}
	...
	{script on="beforeload"}
		return !require('common:static/bigRender.js').add(this);
	{/script}
	...
{/pagelet}
```

####5.3 除框架js之外的所有业务js都使用require.defer（[wiki](https://github.com/hao123-fe/her/wiki/03-02.Javascript)）####

require.defer 会将模块的加载推迟到页面 onload 之后，以防止对首屏速度的影响。

###6.高级功能###

####6.1 Quickling局部刷新####

可以使用 BigPipe.fetch(pagelets[, url, cache]) 函数实现Quickling局部刷新。

同时我们也提供了 pageEmulator.js 监听a标签点击实现局部刷新
```javascript
require.defer('common:static/pageEmulator.js',function(emulator){
    emulator.start();
});
```


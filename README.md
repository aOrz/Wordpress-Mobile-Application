# Wordpress-Mobile-Application
利用`wordpress`作为后台，构建`App`(安卓和IOS)
-------------------
###更新内容
2016.5.15：支持代码高亮，支持语言PHP,JS,CSS,Java等，代码格式`<pre class="lang:js">code</pre>`或`<pre class="lang:js"><code>code<code></pre>`,代码高亮使用了prismjs，做了一些修改，如有其它需求可修改此插件。
###案例体验
我的博客：[奋斗的承诺](https://github.com/4013465w/Wordpress-Mobile-Application/blob/master/unpackage/release/myblog_0331140049.apk?raw=true)
###用到的技术
1. html5+:[http://www.html5plus.org/doc/h5p.html](http://www.html5plus.org/doc/h5p.html)

2. mui:[http://dev.dcloud.net.cn/mui/](http://dev.dcloud.net.cn/mui/)

3. hbuilder:[http://www.dcloud.io/](http://www.dcloud.io/)

-----------------------
###构建方法
1. 安装`wordpress`

2. 为`wordpress`安装 `wordpress rest api` （2.0版本及以上）

3. 在`wordpress`后台：设置/固定链接设置为文章格式

4. 更改`/js/app.js`里面的`name`和菜单名称和对应的`id`（可在`example.com/wp-json/wp/v2/categories`查看）

5. 下载安装`Hbuilder`，使用其在线打包功能，选择文件/打开目录（打开本项目代码目录），双击`manifest.json`设置`app`名称和`id`，修改`app`图标和启动图。

6. 点击发行，发行为原生应用，设置好开发者证书，然后打包。

打包成功后会自动下载到本地目录，这样一个`App`就制作好了。
###修改主题颜色
下载本项目代码，打开css/mystyle.css最后几行有注释声明可以修改颜色值，修改颜色值即可自定义主题颜色。

###项目截图
![首页](https://raw.githubusercontent.com/4013465w/Wordpress-Mobile-Application/master/unpackage/screenshot/1.png)
![菜单](https://raw.githubusercontent.com/4013465w/Wordpress-Mobile-Application/master/unpackage/screenshot/2.png)
![搜索](https://raw.githubusercontent.com/4013465w/Wordpress-Mobile-Application/master/unpackage/screenshot/3.png)
![正文](https://raw.githubusercontent.com/4013465w/Wordpress-Mobile-Application/master/unpackage/screenshot/4.png)
![正文](https://raw.githubusercontent.com/4013465w/Wordpress-Mobile-Application/master/unpackage/screenshot/5.png)
##License

The MIT License (MIT)

Copyright (c) 2016 Zhen.Wang
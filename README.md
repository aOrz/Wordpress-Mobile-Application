# Wordpress-Mobile-Application
利用`wordpress`作为后台，构建`App`(安卓和IOS)
-------------------
###用到的技术
1. html5+:[http://www.dcloud.io/docs/api/](http://www.dcloud.io/docs/api/)

2. mui:[http://dcloudio.github.io/mui/](http://dcloudio.github.io/mui/)

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
![首页](http://www.fddcn.cn/wp-content/uploads/2016/03/Screenshot_2016-03-31-09-27-53_io.dcloud.HBuilder-169x300.png)
![菜单](http://www.fddcn.cn/wp-content/uploads/2016/03/Screenshot_2016-03-31-09-27-56_io.dcloud.HBuilder-169x300.png)
![搜索](http://www.fddcn.cn/wp-content/uploads/2016/03/Screenshot_2016-04-03-12-22-05_io.dcloud.myblog-169x300.png)
![正文](http://www.fddcn.cn/wp-content/uploads/2016/03/Screenshot_2016-04-03-12-22-23_io.dcloud.myblog-169x300.png)
##License

The MIT License (MIT)

Copyright (c) 2016 Zhen.Wang
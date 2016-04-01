# Wordpress-Mobile-Application
利用`wordpress`作为后台，构建`App`
###构建方法
1.安装`wordpress`


2.为`wordpress`安装 `wordpress rest api` （2.0版本及以上）

3.在`wordpress`后台：设置/固定链接设置为文章格式

4.更改`/js/app.js`里面的`name`和菜单名称和对应的`id`（可在`example.com/wp-json/wp/v2/categories`查看）

5.`下载hbuilde`，选择文件/打开目录（打开本项目代码目录），双击`manifest.json`设置`app`名称和`id`，修改`app`图标和启动图。

6.点击发行，发行为原生应用，设置好开发者证书，然后打包。

打包成功后会自动下载到本地目录，这样一个`App`就制作好了。

#License

The MIT License (MIT)

Copyright (c) 2016 Zhen.Wang
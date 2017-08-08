# vue-template-for-hbuilder

> 使用Vue单文件，开发Html5+应用

## 说明：

> 该模板生成自 vue-cli，对其dev模式进行了修改，用来使用hbuilder的开发
>
> 项目背景，自己之前开发了一个 app，使用的mui，后来引入了Vue，由于Hbuilder，还没编译es6的功能，及hbuilder有自己的web服务器，如果我们自己启动web服务的话，又不能将编译结果实时的推送到真机调试模式下，所以产生了修改vue项目模板的需求。

## 使用方法：

1. `git clone git@github.com:4013465w/vue-template-for-hbuilder.git`
2. 修改config目录下的index.js `build`节点下index和assetsRoot路径（建议修改至本项目的同级目录）
3. `npm install && npm run dev`
4. 使用Hbuilder打开2中的目录，初始化，然后真机运行。
5. 编写的代码，会自动编译至2配置的目录，开始你的代码之旅吧~

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

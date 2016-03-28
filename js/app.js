Vue.config.debug = true
	/*
	 * 配置参数
	 */
app = {
		basic_url: 'http://www.fddcn.cn/wp-json/wp/v2/',
		per_page:20
	}
	/*
	 * 组件
	 */
	//头部组件
var MyHeader = Vue.extend({
		props: ['left-icon', 'title', 'right-icon'],
		template: '<header class="mui-bar mui-bar-nav">' +
			'<a class="mui-action-back mui-icon {{left-icon}} mui-pull-left"></a>' +
			'<h1 class="mui-title">{{title}}</h1>' +
			'<a class="mui-action-back mui-icon {{right-icon}} mui-pull-right"></a>' +
			'</header>'
	})
	//图文列表组件
var MyImgList = Vue.extend({
		props: ['title', 'excerpt'],
		template: '<li class="mui-table-view-cell mui-media">' +
			'<a href="javascript:;">' +
			//			'<img class="mui-media-object mui-pull-right" src="./img/shuijiao.jpg">' +
			'<div class="mui-media-body">' +
			'{{title}}' +
			'<p class="mui-ellipsis">{{{excerpt}}}</p>' +
			'</div>' +
			'</a>' +
			'</li>'
	})
	/*
	 * 注册公用组件
	 */
Vue.component('my-header', MyHeader);
/*
 * 文章
 */
var WP = function() {

}
WP.prototype.getData = function(inData) {
	var url = inData.url || app.basic_url;
	inData.data = inData.data||{};
	inData.data.per_page = app.per_page;
	mui.ajax(url + inData.route, {
		data: inData.data,
		dataType: 'json',
		type: 'get',
		success: inData.success,
		error: function() {
			//			alert('出错啦')
			console.log('ajax出错啦')
		},
	})
}
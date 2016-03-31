Vue.config.debug = false
	/*
	 * 配置参数
	 */
app = {
	name:"奋斗的承诺",
		basic_url: 'http://www.fddcn.cn/wp-json/wp/v2/',
		per_page: 20,
		category:[{name:'CSS',catid:65},
				{name:'HTML',catid:59},
				{name:'JS',catid:24},
				{name:"PHP",catid:98}
		]
	}
	/*
	 * 组件
	 */
	//头部组件
var MyHeader = Vue.extend({
		props: ['lefticon', 'title', 'righticon'],
		template: '<header class="mui-bar mui-bar-nav">' +
			'<a id="lefticon" class=" mui-icon {{lefticon}} mui-pull-left"></a>' +
			'<h1 class="mui-title">{{title}}</h1>' +
			'<a class="mui-action-back mui-icon {{righticon}} mui-pull-right"></a>' +
			'</header>'
	})
	//图文列表组件
var MyImgList = Vue.extend({
		props: ['title', 'excerpt', 'id'],
		template: '<li class="mui-table-view-cell mui-media" data-id="{{id}}">' +
			'<a href="javascript:;" data-id="{{id}}">' +
			//'<img class="mui-media-object mui-pull-right" src="./img/shuijiao.jpg">' +
			'<div class="mui-media-body" >' +
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
	inData.data = inData.data || {};
	inData.data.per_page = app.per_page;
	mui.ajax(url + inData.route, {
		data: inData.data,
		dataType: 'json',
		type: 'get',
		success: inData.success,
		error: inData.error,
	})
}
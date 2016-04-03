//Vue.config.debug = false
	/*
	 * 配置参数
	 */
app = {
	name:"奋斗的承诺",
		basic_url: 'http://www.fddcn.cn/wp-json/wp/v2/',
		per_page: 20,
		category:[{name:'CSS',catid:65},
				{name:'HTML',catid:59},
				{name:'JS',catid:182},
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
			'<a id="righticon" class="mui-icon {{righticon}} mui-pull-right"></a>' +
			'</header>'
	})
	//图文列表组件
var MyImgList = Vue.extend({
		props: ['title', 'excerpt', 'id','author'],
		template: '<li class="mui-table-view-cell mui-media" data-id="{{id}}" data-author="{{author}}">' +
			'<a href="javascript:;" >' +
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
	inData.data.per_page = inData.data.per_page || app.per_page;
	mui.ajax(url + inData.route, {
		data: inData.data,
		dataType: 'json',
		type: 'get',
		success: inData.success,
		error: inData.error,
	})
}
/**
 * 调用系统分享
 * 调用
 */
function shareSystem(sharecontent) {
	if(plus.os.name!=="Android"){
		plus.nativeUI.alert("此平台暂不支持系统分享功能!");
		return;
	}
	var intent=new Intent(Intent.ACTION_SEND);
	var p = "";
		intent.setType("text/plain");
	intent.putExtra(Intent.EXTRA_SUBJECT,app.name);
	intent.putExtra(Intent.EXTRA_TEXT,sharecontent);
	intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
	main.startActivity(Intent.createChooser(intent,"系统分享"));
}
/**
 * 更新分享服务
 */
function updateSerivces(){
	plus.share.getServices( function(s){
		shares={};
		for(var i in s){
			var t=s[i];
			shares[t.id]=t;
		}
	}, function(e){
		console.log( "获取分享服务列表失败："+e.message );
	} );
}
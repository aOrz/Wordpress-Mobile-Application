//Vue.config.debug = false
/*
 * 配置参数
 */
window.app = {
  name: "奋斗的承诺",
  basic_url: 'https://fddcn.cn/wp-json/wp/v2/',
  per_page: 20,
  request_timeout: 15000, // 请求超时（毫秒）
  cache_ttl: 10 * 60 * 1000, // 列表/标签缓存有效期，默认 10 分钟
  category: [{ //侧滑菜单配置项
      name: 'CSS',
      catid: 65
    }, {
      name: 'HTML',
      catid: 59
    }, {
      name: 'JS',
      catid: 182
    }, {
      name: "PHP",
      catid: 98
    }],
  nav_bar: [{ //底部菜单配置项
      name: '首页',
      class: 'mui-icon-home' //没有catid 默认为首页
    },
    {
      name: 'JS',
      class: 'mui-icon-compose', //图标样式
      catid: '182'
    },
    {
      name: 'css',
      class: 'mui-icon-email',
      catid: 65
    },
    {
      name: 'php',
      class: 'mui-icon-contact',
      catid: 98
    },
    {
      name: '其他',
      class: 'mui-icon-gear',
      catid: 48
    }
  ]
}

/*
 * 通用工具
 */
window.util = {
  /* 安全读取 localStorage，脏数据不再导致白屏 */
  getJSON: function(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      try { localStorage.removeItem(key); } catch (_) {}
      return fallback;
    }
  },
  /* 带过期时间的缓存：返回 null 表示已过期，调用方应走网络 */
  getCache: function(key, ttl) {
    var box = util.getJSON(key, null);
    if(!box || typeof box.t !== 'number') return null;
    if(Date.now() - box.t > (ttl || app.cache_ttl)) return null;
    return box.d;
  },
  setCache: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        t: Date.now(),
        d: data
      }));
    } catch (e) {
      // 存储已满或被禁用，静默降级
    }
  },
  /* 日期格式化：2026-10-26T10:00:00 -> 2026-10-26 */
  formatDate: function(value) {
    if(!value) return '';
    return String(value).split('T')[0];
  },
  /* HTML 白名单清洗，防止 WordPress 内容注入脚本 */
  sanitize: function(html) {
    if(!html) return '';
    var ALLOWED = {
      A: 1, P: 1, BR: 1, SPAN: 1, DIV: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, S: 1,
      CODE: 1, PRE: 1, BLOCKQUOTE: 1, UL: 1, OL: 1, LI: 1, DL: 1, DT: 1, DD: 1,
      H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, IMG: 1, FIGURE: 1, FIGCAPTION: 1,
      TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TD: 1, TH: 1, HR: 1,
      IFRAME: 1, VIDEO: 1, AUDIO: 1, SOURCE: 1
    };
    var doc;
    try {
      doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    } catch (e) {
      return '';
    }
    var root = doc.body.firstChild;
    if(!root) return '';
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    var drop = [];
    while(walker.nextNode()) {
      var el = walker.currentNode;
      if(!ALLOWED[el.tagName]) {
        drop.push(el);
        continue;
      }
      for(var i = el.attributes.length - 1; i >= 0; i--) {
        var attr = el.attributes[i];
        var name = attr.name.toLowerCase();
        var val = String(attr.value || '');
        var isEvent = name.indexOf('on') === 0;
        var isBadProto = (name === 'href' || name === 'src' || name === 'xlink:href') &&
          /^\s*(javascript|vbscript|data:text\/html)/i.test(val);
        if(isEvent || name === 'srcdoc' || isBadProto) {
          el.removeAttribute(attr.name);
        }
      }
      if(el.tagName === 'A') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
      if(el.tagName === 'IMG') {
        el.setAttribute('loading', 'lazy');
        el.setAttribute('decoding', 'async');
      }
    }
    for(var j = 0; j < drop.length; j++) {
      if(drop[j].parentNode) drop[j].parentNode.removeChild(drop[j]);
    }
    return root.innerHTML;
  }
}

/*
 * 组件
 */
//头部组件
var MyHeader = Vue.extend({
  props: ['lefticon', 'title', 'righticon'],
  template: '<header class="mui-bar mui-bar-nav">' +
    '<a id="lefticon" class=" mui-icon mui-pull-left" :class="lefticon"></a>' +
    '<h1 class="mui-title">{{title}}</h1>' +
    '<a id="righticon" class="mui-icon mui-pull-right" :class="righticon"></a>' +
    '</header>'
})

//图文列表组件
var MyImgList = Vue.extend({
  props: ['title', 'excerpt', 'id', 'author', 'date', 'featured_image_src'],
  template: '<li class="mui-table-view-cell mui-media" :data-id="id" :data-author="author">' +
    '<a href="javascript:;">' +
    '<img class="mui-media-object mui-pull-left" v-if="featured_image_src" :src="featured_image_src" loading="lazy" decoding="async" alt="" onerror="this.style.visibility=\'hidden\'">' +
    '<div class="mui-media-body mui-ellipsis">' +
    '{{title}}' +
    '<p class="mui-ellipsis text" v-html="excerpt"></p>' +
    '</div>' +
    '</a>' +
    '</li>'
})

/*
 * 注册公用组件
 */
Vue.component('my-header', MyHeader);
Vue.filter('getdate', function(value) {
  return util.formatDate(value);
})

/*
 * 文章请求封装：统一超时、统一错误
 */
var WP = function() {}
WP.prototype.getData = function(inData) {
  var url = inData.url || app.basic_url;
  var route = inData.route || '';
  var data = inData.data || {};
  data.per_page = data.per_page || app.per_page;
  return mui.ajax(url + route, {
    data: data,
    dataType: 'json',
    type: 'get',
    timeout: app.request_timeout,
    success: function(res) {
      if(inData.success) inData.success(res);
    },
    error: function(xhr, type) {
      if(inData.error) inData.error(xhr, type);
      else mui.toast('网络不太好了，稍后再试');
    }
  });
}

/**
 * 调用系统分享（Android / iOS 统一走 plus.share，Android 老版本回落 Intent）
 */
var shares = null;

function updateSerivces() {
  if(!window.plus || !plus.share) return;
  plus.share.getServices(function(s) {
    shares = {};
    for(var i in s) {
      var t = s[i];
      shares[t.id] = t;
    }
  }, function(e) {
    console.log("获取分享服务列表失败：" + e.message);
  });
}

function androidShare(sharecontent) {
  try {
    var Intent = plus.android.importClass("android.content.Intent");
    var main = plus.android.runtimeMainActivity();
    var intent = new Intent(Intent.ACTION_SEND);
    intent.setType("text/plain");
    intent.putExtra(Intent.EXTRA_SUBJECT, app.name);
    intent.putExtra(Intent.EXTRA_TEXT, sharecontent);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    main.startActivity(Intent.createChooser(intent, "系统分享"));
  } catch (e) {
    plus.nativeUI.toast('分享失败：' + e.message);
  }
}

function shareSystem(sharecontent) {
  if(!window.plus) return;
  if(plus.share && plus.share.sendWithSystem) {
    plus.share.sendWithSystem({
      type: 'text',
      content: sharecontent
    }, function() {}, function(e) {
      // iOS 取消分享也会走失败回调，这里不再弹窗打扰
      if(plus.os.name === 'Android') androidShare(sharecontent);
    });
    return;
  }
  if(plus.os.name === 'Android') {
    androidShare(sharecontent);
  } else {
    plus.nativeUI.alert("此平台暂不支持系统分享功能!");
  }
}

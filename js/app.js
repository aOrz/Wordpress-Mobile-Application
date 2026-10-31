//Vue.config.debug = false
if (window.Vue) {
  Vue.config.productionTip = false; // 去掉控制台 "You are running Vue in development mode" 提示
  Vue.config.devtools = false; // 线上关闭 devtools 探测
}
/*
 * 配置参数
 */
window.app = {
  name: "奋斗的承诺",
  basic_url: 'https://fddcn.cn/wp-json/wp/v2/',
  per_page: 20,
  request_timeout: 15000, // 请求超时（毫秒）
  request_retry: 1, // 超时/网络错误自动重试次数
  cache_ttl: 10 * 60 * 1000, // 列表/标签缓存有效期，默认 10 分钟
  cache_max_bytes: 512 * 1024, // 单个缓存项字符上限，超过则不落盘（防止撑爆 localStorage）
  debug: false,
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
  CACHE_INDEX: 'cache_index',
  /* 带过期时间的缓存：返回 null 表示已过期，调用方应走网络 */
  getCache: function(key, ttl) {
    var box = util.getJSON(key, null);
    if(!box || typeof box.t !== 'number') return null;
    if(Date.now() - box.t > (ttl || app.cache_ttl)) return null;
    return box.d;
  },
  /* 判断缓存是否仍然新鲜，供调用方决定是否跳过网络请求 */
  isFresh: function(key, ttl) {
    var box = util.getJSON(key, null);
    return !!(box && typeof box.t === 'number' && (Date.now() - box.t) <= (ttl || app.cache_ttl));
  },
  /* 不稳定参数排序，生成可复用的缓存键 / 请求键 */
  paramString: function(params) {
    var keys = [];
    for(var k in params) {
      if(Object.prototype.hasOwnProperty.call(params, k) && params[k] !== undefined && params[k] !== '') {
        keys.push(k);
      }
    }
    keys.sort();
    var arr = [];
    for(var i = 0; i < keys.length; i++) {
      arr.push(encodeURIComponent(keys[i]) + '=' + encodeURIComponent(String(params[keys[i]])));
    }
    return arr.join('&');
  },
  /* 缓存索引：记录写入时间与体积，用于超限时按 LRU 淘汰 */
  readIndex: function() {
    return util.getJSON(util.CACHE_INDEX, {}) || {};
  },
  touchIndex: function(key, size) {
    var idx = util.readIndex();
    idx[key] = {
      t: Date.now(),
      s: size
    };
    try {
      localStorage.setItem(util.CACHE_INDEX, JSON.stringify(idx));
    } catch (e) {}
  },
  /* 按写入时间从旧到新淘汰一半缓存，只动自己写过的 key，不碰用户数据 */
  evict: function() {
    var idx = util.readIndex();
    var keys = [];
    for(var k in idx) {
      if(Object.prototype.hasOwnProperty.call(idx, k)) keys.push(k);
    }
    keys.sort(function(a, b) {
      return (idx[a].t || 0) - (idx[b].t || 0);
    });
    var drop = Math.ceil(keys.length / 2);
    for(var i = 0; i < drop; i++) {
      try { localStorage.removeItem(keys[i]); } catch (e) {}
      delete idx[keys[i]];
    }
    try {
      localStorage.setItem(util.CACHE_INDEX, JSON.stringify(idx));
    } catch (e) {}
    return drop;
  },
  setCache: function(key, data) {
    var payload;
    try {
      payload = JSON.stringify({
        t: Date.now(),
        d: data
      });
    } catch (e) {
      return false;
    }
    // 超出单项上限就不落盘：宁可下次走网络，也不让整个 localStorage 写入失败
    if(payload.length > app.cache_max_bytes) return false;
    try {
      localStorage.setItem(key, payload);
    } catch (e) {
      // 空间不足：先按 LRU 淘汰，再重试一次
      util.evict();
      try {
        localStorage.setItem(key, payload);
      } catch (e2) {
        return false;
      }
    }
    util.touchIndex(key, payload.length);
    return true;
  },
  /* 清除指定前缀缓存（下拉刷新后失效同组数据） */
  clearCacheByPrefix: function(prefix) {
    var idx = util.readIndex();
    var keys = [];
    for(var k in idx) {
      if(Object.prototype.hasOwnProperty.call(idx, k) && k.indexOf(prefix) === 0) keys.push(k);
    }
    for(var i = 0; i < keys.length; i++) {
      try { localStorage.removeItem(keys[i]); } catch (e) {}
      delete idx[keys[i]];
    }
    try {
      localStorage.setItem(util.CACHE_INDEX, JSON.stringify(idx));
    } catch (e) {}
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
  },
  /* 正文图片全屏预览：不依赖 plus，H5 与 App 通用 */
  closePreview: function() {
    var mask = document.getElementById('img-preview-mask');
    if(mask && mask.parentNode) mask.parentNode.removeChild(mask);
    document.documentElement.style.overflow = '';
  },
  previewImage: function(src) {
    if(!src) return;
    util.closePreview();
    var mask = document.createElement('div');
    mask.id = 'img-preview-mask';
    mask.className = 'img-preview-mask';
    var img = document.createElement('img');
    img.className = 'img-preview-img';
    img.src = src;
    img.alt = '';
    var tip = document.createElement('div');
    tip.className = 'img-preview-tip';
    tip.innerText = '点击任意处关闭';
    mask.appendChild(img);
    mask.appendChild(tip);
    mask.addEventListener('click', util.closePreview);
    mask.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, { passive: false });
    document.body.appendChild(mask);
  },
  /* 给正文容器内的图片绑定点击预览（事件委托，v-html 更新后无需重绑） */
  bindImagePreview: function(root, selector) {
    if(!root) return;
    root.addEventListener('click', function(e) {
      var target = e.target;
      if(!target || target.tagName !== 'IMG') return;
      if(selector && !target.closest) return;
      var src = target.getAttribute('data-src') || target.getAttribute('src');
      if(!src) return;
      // 小图标（如表情、站内小图）不拦截
      if(target.clientWidth && target.clientWidth < 40) return;
      e.preventDefault();
      util.previewImage(src);
    });
  },
  /* 切换文章时把正文滚回顶部，避免停在上一次的阅读位置 */
  resetScroll: function(selector) {
    try {
      var el = document.querySelector(selector);
      if(el) el.scrollTop = 0;
      window.scrollTo(0, 0);
      if(window.mui && mui('.mui-scroll-wrapper').scroll) {
        var sc = mui('.mui-scroll-wrapper').scroll();
        if(sc && sc.scrollTo) sc.scrollTo(0, 0, 0);
      }
    } catch (e) {}
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
 * 文章请求封装：统一超时、并发去重、失败重试、统一错误
 */
var WP = function() {}
var wpInflight = {}; // 进行中的请求，key -> 等待中的配置列表
WP.prototype.getData = function(inData) {
  inData = inData || {};
  var url = inData.url || app.basic_url;
  var route = inData.route || '';
  var data = inData.data || {};
  data.per_page = data.per_page || app.per_page;

  var key = url + route + '?' + util.paramString(data);

  // 同一个请求在途时直接挂到队列上，避免详情页/列表页重复打网络
  if(!inData.noDedupe && wpInflight[key]) {
    wpInflight[key].push(inData);
    return;
  }
  wpInflight[key] = [inData];

  var attempt = 0;

  function flush(hasError, res, xhr, type) {
    var queue = wpInflight[key] || [];
    delete wpInflight[key];
    for(var i = 0; i < queue.length; i++) {
      var cfg = queue[i];
      if(hasError) {
        if(cfg.error) cfg.error(xhr, type);
        else mui.toast('网络不太好了，稍后再试');
      } else if(cfg.success) {
        cfg.success(res);
      }
    }
  }

  function send() {
    mui.ajax(url + route, {
      data: data,
      dataType: 'json',
      type: 'get',
      timeout: app.request_timeout,
      success: function(res) {
        if(app.debug) console.log('[WP] ok ' + route, res);
        flush(false, res);
      },
      error: function(xhr, type) {
        // 只对超时/断网重试；JSON 解析失败、4xx 重试没意义，直接抛给调用方
        if(attempt < app.request_retry && (type === 'timeout' || type === 'error')) {
          attempt++;
          if(app.debug) console.log('[WP] retry#' + attempt + ' ' + route);
          setTimeout(send, 500 * attempt);
          return;
        }
        if(app.debug) console.log('[WP] fail ' + route, type);
        flush(true, null, xhr, type);
      }
    });
  }

  send();
}

/*
 * 全局错误兜底：脚本异常不再静默白屏，至少留一条可定位的日志
 */
window.addEventListener('error', function(e) {
  try {
    var msg = e && e.message ? e.message : 'unknown error';
    console.error('[app error] ' + msg + (e && e.filename ? ' @ ' + e.filename + ':' + e.lineno : ''));
  } catch (_) {}
}, true);
window.addEventListener('unhandledrejection', function(e) {
  try {
    console.error('[app reject]', e && e.reason);
  } catch (_) {}
});

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

# common 常用的样式或js
> 样式可能是在网上发现的,
> 但js全部为自己编写, 且不需要依赖其他类库
---

## ./commonCss
##### 存储了一些常用的css样式, 包括less和编译完成的css

## ./error
##### 一个提供抛出一组错误的error.js文件
- 格式为 throwError('组标题', '错误日志[数组]', '类型,可选[error, log, info]');
```
    throwError('error',[
        'log: xxxxx',
        'log: xxxxx',
        'log: xxxxx'
    ], 'log');
```

## ./getStyle `兼容低版本浏览器`
##### 使用原生javascript实现获取css样式的值
- getStyle(元素, 'css样式');
```
getStyle(dom, 'height');
```

## ./ajax
##### 使用原生javascript实现ajax
- request(option);

###### option 可选字段
- url {String} 发送请求的地址
- type {String} 默认为post, 请求方式(post或get)
- timeout {Number} 设置请求超时时间(毫秒)
- cache {Boolean} 默认为true, 设置为false将不会从浏览器缓存中加载请求信息
- data {object} 发送到服务器的数据
- dataType {String} 预期服务器返回的数据类型.
    - dom  返回一个对象
    - json 返回一个对象
    - text 返回纯文本字符串
- contentType {String} 当发送信息至服务器时,内容编码类型默认为"application/x-www-form-urlencoded".该默认值适合大多数应用场合.
- autoHide {Boolean} 请求完毕后是否不等待其他代码,直接结束loading
- traditional：{Boolean} 是否传统序列化
- bind {string|element} loading绑定的父元素
- loading {Function} loading的html,或元素
- httpHeader {object} 发送的http请求头, 以键值对的形式传入
- mosaic {array} 如果发送的是get请求,mosaic参数将作为参数的模板,默认为 ['&', '=', '?'] *禁用*
- beforeSend {Function} 发送请求前可以修改XMLHttpRequest对象的函数
- complete {Function} 请求完成后调用的回调函数(请求成功或失败时均调用)
- success {Function} 请求成功后调用的回调函数
- error {Function} 请求失败时被调用的函数
```
// 一个简单的例子
request({
    url: 'index.php',
    success: function(json){
        console.log(json);
    }
});
```
## ./showTitle
##### 使用原生javascript 模拟jquery-tooltip功能, 并支持实时的检测
- 更新修改了一个滚动条下出现错位的BUG

1.超出提示title,例子
```
<p showellipsis>1000</p>
```

2.如果需要不超出也能显示提示, 且显示内容固定
```
<p showellipsis="显示的内容">1000</p>
```
## ./formSubmit
##### 使用原生javascript 实现获取一个表单元素, 并且做出一系列扩展, 支持脱离form 菜单
html结构
```
<div id="rg-content" form-name="group" form-main="group"></div>
<div form-parent="group" form-name="a">100</div>
<div form-parent="group" form-name="b">200</div>
<div form-parent="group" form-name="c">300</div>
```
js获取
```
form(document.getElementById('rg-content'));
// {a: 100,b: 200,c: 300}
```

## ./miscellaneous
##### 提供了一些常用的API, 比较杂, 没有进行归类
- 常量 emailBlackList 提供了比较全的共用邮箱后缀
- isEmail() 能够检查是否是邮箱
- isMobileFormat() 能够检查是否是手机号
- isEmailBlackList() 能够检查是否是企业邮箱(在emailBlackList中做排除)
- bindReSize() 为元素绑定resize事件(目前只能判断窗口变化时, dom元素的大小是否发生了变化)
- cancelReSize() 解绑resize事件

## ./dataStructure
##### 提供了一个存储数据库的结构
 - option 配置
 `repeat: 是否去重, 默认为true, 如果该参数为true 那么g参数则为false`
 `key: 作为 搜索的key 不设置key,无法进行去重`
 `weakCheck: 是否深度匹配 (在对比2个对象或数组时,是否要保证数据的一致性) 默认为 true [如果对比将消耗相当的内存]`
 `callback: 内容被修改之后的回掉函数, 修改之前不会产生回调`
 `intercept: 在数据修改/加入之前的回调函数, 如果返回false, 则不会加入, 可以修改传入的data`
 `cover: 如果出现重复的值是否覆盖`
 `g: 是否作为全局匹配,如果为false只匹配第一个成功匹配的值`
 - 创建
 ```
 var data = new DataStructure({key: 'id'});
 ```

 - 属性
 ```
 data.length; // 该变量中存储的数据个数

 ```

 - 方法(未整理)
 ```
 set, get, indexOf, has, clear, setOption, debug
 ```

## ./waterfall(requireJS)
##### 提供了table的瀑布流动态加载, 以及几个瀑布流之前的内容切换, 第二次加载无需发送请求

- 方法(未整理)
```
add, check, show, hide, gGetData, gCacheHtml, external, debug, html, remove, init
```


## 更多
##### 更多使用功能正在整理中...
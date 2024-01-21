# 鸿蒙提供我思路，简单实现js控制dom

现在前端框架越来越多，参考鸿蒙，如果所有的元素都是自己控制，是不是没有js的虚拟dom更新，也不用比较。再结合vue3的响应式数据思想，可以实现一个简单的js控制dom的思路。


```js
Build("#app", () => {
  const val = ref("abc"); // 设置响应式数据
  // 页面绑定响应式数据，同时初始化收集依赖
  Text(() => val.value).onClick(() => {
    // 点击修改数据
    if (val.value === "abc") {
      val.value = "efg";
    } else {
      val.value = "abc";
    }
  });
});
```

## sass 转 css

```bash
sass -w hm.scss:hm.css
```
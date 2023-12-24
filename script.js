const eventMap = {};
const event = {
  $on: (name, fn) => {
    if (!eventMap[name]) {
      eventMap[name] = [];
    }
    eventMap[name].push(fn);
  },
  $emit: (name) => {
    if (eventMap[name]) {
      eventMap[name].forEach((fn) => {
        fn();
      });
    }
  },
};
let ids = [];
let isMounted = false;
let parentList = [];
// js 随机得到一个8位数的id
const getId = () => Math.random().toString(36).slice(-8);
const setVal = (str, fn, node) => {
  if (typeof str === "function") {
    // 开始收集依赖
    ids = [];
    node && parentList.push(node);
    const html = str();
    if (html !== undefined) {
      fn(html);
      // 结束收集依赖
      ids.forEach((id) => {
        event.$on(id, () => {
          fn(str());
        });
      });
    }
    node && parentList.pop();
  } else {
    fn(str ?? "");
    // node.innerHTML = str ?? "";
  }
};
const createComponent = (type, html) => {
  const node = document.createElement(type);
  const nodeId = getId();
  node.id = nodeId;

  parentList[parentList.length - 1].appendChild(node);

  setVal(
    html,
    (html) => {
      node.innerHTML = html;
    },
    node
  );

  return {
    fontSize(size) {
      setVal(size, (size) => {
        node.style.fontSize = `${size}px`;
      });

      return this;
    },
    color(color) {
      // node.style.color = color;
      setVal(color, (color) => {
        node.style.color = color;
      });

      return this;
    },
    onClick(fn) {
      if (!eventMap[nodeId]) {
        eventMap[nodeId] = [];
      }
      if (eventMap[nodeId].includes(fn)) {
        return;
      }
      eventMap[nodeId].push(fn);
      return this;
    },
  };
};
export const Text = (str) => createComponent("span", str);
export const View = (str) => createComponent("div", str);
export const Button = (str) => createComponent("button", str);
export const Build = function (selector, fn) {
  const app = document.querySelector(selector);

  // 添加事件监听器到父元素
  app.addEventListener("click", function (event) {
    // 检查点击的是 li 元素
    if (eventMap[event.target.id]) {
      eventMap[event.target.id].forEach((fn) => {
        fn();
      });
    }
  });

  parentList = [app];
  isMounted = false;
  fn.call(app);
  isMounted = true;
  // app.appendChild(elRoot);
};
const createReactive = (obj) =>
  new Proxy(obj, {
    get: function (target, key) {
      // debugger
      // console.log('get')
      if (!isMounted) {
        this.id = getId();
        ids.push(this.id);
      }
      return target[key];
    },
    set: function (target, key, value) {
      // debugger
      // console.log('set')
      // debugger
      target[key] = value;
      event.$emit(this.id);
      // console.log(target, key, value);
      return true;
    },
  });
export const ref = (val) => {
  return createReactive({
    value: typeof val === "object" ? createReactive(val) : val,
  });
};

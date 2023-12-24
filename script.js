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
let startGet = false;
let parentList = [];
// js 随机得到一个8位数的id
const getId = () => Math.random().toString(36).slice(-8);
const createComponent = (type, str) => {
  const node = document.createElement(type);
  const nodeId = getId();
  node.id = nodeId;

  parentList[parentList.length - 1].appendChild(node);

  if (typeof str === "function") {
    // 开始收集依赖
    ids = [];
    parentList.push(node)
    startGet = true;
    const html = str();
    startGet = false;
    if (html !== undefined) {
      node.innerHTML = html;
    }
    // 结束收集依赖
    ids.forEach((id) => {
      event.$on(id, () => {
        node.innerHTML = str();
      });
    });
    parentList.pop()
  } else {
    node.innerHTML = str ?? "";
  }

  return {
    fontSize(size) {
      node.setAttribute('fz', size);
      return this;
    },
    color(color) {
      node.setAttribute('c', color);
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
}
export const Text =  (str) => createComponent('span', str);
export const View =  (str) => createComponent('div', str);
export const Button =  (str) => createComponent('button', str);
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

  fn.call(app);

  // app.appendChild(elRoot);
};
const createReactive = (obj) =>
  new Proxy(obj, {
    get: function (target, key) {
      // debugger
      // console.log('get')
      if (startGet) {
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

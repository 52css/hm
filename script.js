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
let elApp;
let elParent;
let elRootParent;
let elRoot;
// js 随机得到一个8位数的id
const getId = () => Math.random().toString(36).slice(-8);
export const Text = function (str) {
  const node = document.createElement("span");
  const nodeId = getId();
  node.id = nodeId;
  // debugger

  // console.log('create', nodeId)

  // debugger
  // elParent = node;
  // elParent = node;
  if (typeof str === "function") {
    // 开始收集依赖
    ids = [];
    startGet = true;
    node.innerHTML = str() ?? "";
    startGet = false;
    // 结束收集依赖
    ids.forEach((id) => {
      event.$on(id, () => {
        node.innerHTML = str();
      });
    });
  } else {
    node.innerHTML = str ?? "";
  }

  // console.log(elParent, "append", nodeId);
  elParent.appendChild(node);
  // debugger
  // elParent = node.parentNode;

  // console.log(elParent);

  return {
    onClick: (fn) => {
      if (!eventMap[nodeId]) {
        eventMap[nodeId] = [];
      }
      if (eventMap[nodeId].includes(fn)) {
        return;
      }
      eventMap[nodeId].push(fn);
    },
  };
};
export const Build = function (selector, fn) {
  elRootParent = document.querySelector(selector);
  elRoot = document.createDocumentFragment();
  elParent = elRoot;

  // 添加事件监听器到父元素
  elRootParent.addEventListener("click", function (event) {
    // 检查点击的是 li 元素
    if (eventMap[event.target.id]) {
      eventMap[event.target.id].forEach((fn) => {
        fn();
      });
    }
  });

  fn.call(elRootParent);

  elRootParent.appendChild(elRoot);
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

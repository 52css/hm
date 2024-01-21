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
let elParentList = [];
let elRootParent;
let elRoot;
// js 随机得到一个8位数的id
const getId = () => Math.random().toString(36).slice(-8);
const createElement = (tagName, str) => {
  const node = document.createElement(tagName);
  const nodeId = getId();
  node.id = nodeId;
  elParentList.push(node);
  if (typeof str === "function") {
    // 开始收集依赖
    ids = [];
    startGet = true;

    const html = str();

    if (html !== undefined) {
      node.innerHTML = html;
    }
    startGet = false;

    if (html !== undefined) {
      // 结束收集依赖
      ids.forEach((id) => {
        event.$on(id, () => {
          node.innerHTML = str() ?? "";
        });
      });
    }
  } else {
    node.innerHTML = str ?? "";
  }

  elParentList[elParentList.length - 2].appendChild(node);
  // console.log('elParentList', elParentList[elParentList.length - 2], node)
  elParentList.pop();
  // elParent.appendChild(node);

  const rtv = {
    onClick(fn) {
      if (!eventMap[nodeId]) {
        eventMap[nodeId] = [];
      }
      if (eventMap[nodeId].includes(fn)) {
        return this;
      }
      eventMap[nodeId].push(fn);

      return this;
    },
  }

  ;["flex", "flexCol", "gap", "text"].forEach((fnName) => {
    rtv[fnName] = function (val) {
      const className = fnName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      if (val === false) {
        node.classList.remove(`${className}`);
        return this;
      }
      node.classList.add(`${className}`);
      if (val !== undefined) {
        node.classList.add(`${className}-${val}`);
      }
      return this;
    };
  })


  return rtv ;
};
export const Text = function (str) {
  return createElement("span", str);
};
export const View = function (str) {
  return createElement("div", str);
};
export const Button = function (str) {
  return createElement("button", str);
};
export const H1 = function (str) {
  return createElement("h1", str);
};
export const H2 = function (str) {
  return createElement("h2", str);
};
export const H3 = function (str) {
  return createElement("h3", str);
};
export const H4 = function (str) {
  return createElement("h4", str);
};
export const H5 = function (str) {
  return createElement("h5", str);
};
export const H6 = function (str) {
  return createElement("h6", str);
};
export const Build = function (selector, fn) {
  elRootParent = document.querySelector(selector);
  elRoot = document.createDocumentFragment();
  elParentList = [elRoot];

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
      if (startGet) {
        this.id = getId();
        ids.push(this.id);
      }
      return target[key];
    },
    set: function (target, key, value) {
      target[key] = value;
      event.$emit(this.id);
      return true;
    },
  });
export const ref = (val) => {
  return createReactive({
    value: typeof val === "object" ? createReactive(val) : val,
  });
};

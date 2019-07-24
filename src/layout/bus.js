// 简单情况下使用一个空的Vue 对象作为中央事件总线，实现非父子组件通信

import Vue from 'vue';

// 使用 Event Bus
const bus = new Vue();

export default bus;
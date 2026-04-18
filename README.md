[![CI](https://github.com/yuan-shuo/vvtf/workflows/CI/badge.svg)](https://github.com/yuan-shuo/vvtf/actions)

前端框架: 
1. 核心目的: 兼容gozero生成的ts代码，在同一项目下允许goctl直接朝向此框架下的src/api/<微服务名>目录生成ts代码文件供vue组件调用，只需要关注页面逻辑，其余全部大幅度简化或去除
2. 技术栈: Vue 3 + TypeScript + Vite + gozero
3. 拒绝使用任何CSS样式，包括但不限于全局样式、组件样式、布局样式等
4. 路由需要手动管理，只需要专注于目录、vue文件的创建、vue内容的编写即可
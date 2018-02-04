### mini-vue

一个模仿vue的响应式框架

### 实现

- [x] 响应式系统，数据改变，页面自动改变
- [x] 事件循环，批处理更新DOM
- [x] 虚拟dom，局部刷新页面
- [x] l-directive标签（l-for , l-if , l-model , l-on）
- [x] dom api事件代理，和视图层有关的操作全在这里


<img width="900"  src="https://github.com/liberties/mini-vue/blob/master/static/mini-vue.gif"/>

将data和watch，computed，render绑定关联起来，构成响应式系统的核心。

render每次都会将template处理成一个纯粹的vnode。

其中处理vnode先通过parse将template构成一个带变量和l-if标签的vnode（此处的vnode可以作为一个ast，只需生成一次）

然后通过optimize（每次更新页面都要执行），解析变量数据和l标签，生成一个纯粹的vnode（更新页面都要重新生成）。

然后通过diff比较新旧的vnode。

diff的比较中，会发现新旧dom的差异，然后直接更新，其中更新操作被domProxy代理，domProxy中封装着所有对view层的操作方法，执行方法时会根据方法的白名单，将需要批处理dom更新的操作统一放到宏任务中。

提及一下virtual dom，virtual dom的价值不在于速度快，很多时候手动操作dom速度更快，没有什么操作会比直接的原生操作快，但手动操作在项目比较复杂的时候会很吃力，维护性很差，才有了虚拟dom，它在普适性、效率、可维护性之间达平衡。并且它可以让js专心去写业务，让dom的api负责渲染就行，如果有一天换了一个平台，也许我们只需要将dom的渲染api替换成ios或者安卓的渲染api，类似reactnative。
# universe

## 预览

[哔哩哔哩](https://www.bilibili.com/video/BV19F411p7Dj?share_source=copy_web)

## git started

### 对于在 html 文件中

1. 新建你的文件夹
2. 引入这个依赖

   > pnpm i @mekefly/universe

   或

   > npm i @mekefly/universe

3. 新建一个 index.html 在其中加入以下代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <canvas id="universe"> </canvas>
    <script type="module">
      //需要使用vscode live serve打开，直接打开会因为文件连接不允许获取文件，夸域错误
      alert(`
        shift + 鼠标：左键拖动画布
        shift + 滚轮：放大缩小
        shift + n  ：添加一个星球
      `)

      import { Universe } from './node_modules/@mekefly/universe/lib/universe.esm.js'

      new Universe(document.getElementById('universe'))
    </script>
    <style>
      * {
        margin: 0px;
        padding: 0px;
      }

      body {
        overflow: hidden;
      }
      #universe {
        background-color: #000;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }
    </style>
  </body>
</html>
```

4. 使用 live server 之类的程序运行

### 对于任何 cjs 项目

你只需要像下面这样

- js 项目

```js
var { Universe } = require('universe')
//这是一个类,我们只需要new它并传入一个canvasDOM（<canvas id = "canvas"></canvas> ,使用Document.getElementById("canvas")）
new Universe(document.getElementById('universe'))
//这样就可以了
```

- ts 项目

```js
import { Universe } from 'universe'
//这是一个类,我们只需要new它并传入一个canvasDOM（<canvas id = "canvas"></canvas> ,使用Document.getElementById("canvas")）
new Universe(document.getElementById('universe'))
//这样就可以了
```

### 克隆项目运行

1. 克隆

```shell
 git clone https://github.com/mekefly/universe.git
```

2. 使用 live serve 运行项目目录中的 test.html

## 操作

- shift + 鼠标：左键拖动画布
- shift + 滚轮：放大缩小
- shift + n ：添加一个星球

## ！

项目中有一部分是关于四叉树万有引力模拟的代码，并没有启用，因为可能有相关 bug 没找到，导致运行精度异常，没使用四叉树运行的情况下运行效率很低

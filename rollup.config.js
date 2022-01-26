import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import ts from "rollup-plugin-typescript2";
import path from "path";
import packageJSON from "./package.json";

const getPath = (_path) => path.resolve(__dirname, _path);

const extensions = [".js", ".ts", ".tsx"];

// // ts
const tsPlugin = ts({
  tsconfig: getPath("./tsconfig.esm.json"), // 导入本地ts配置
  extensions,
});

const resolvePlugin = resolve(extensions);
const commonjsPlugin = commonjs();

const commonConf = {
  input: getPath("./src/index.ts"),
  plugins: [tsPlugin, resolvePlugin],
  output: {
    name: packageJSON.name,
  },
};
const preOutName = "wtsc";
const output = (type, preName = preOutName) =>
  path.resolve(__dirname, "lib", `${preName}.${type}.js`);

const OutputFormat = {
  //  异步模块定义，用于像RequireJS这样的模块加载器
  AMD: "amd",
  //CommonJS，适用于 Node 和 Browserify/Webpack
  CJS: "cjs",
  ESM: "esm",
  IIFE: "iife",
  UMD: "umd",
  SYSTEM: "system",
};
function genOutPut(type) {
  return {
    output: {
      format: type,
      file: output(type),
    },
  };
}

const builds = [
  {
    output: {
      file: packageJSON.main,
      format: OutputFormat.CJS,
    },
  },
  {
    output: {
      file: packageJSON.module,
      format: OutputFormat.ESM,
    },
  },
  {
    output: {
      name: packageJSON.name,
      file: packageJSON.unpkg,
      format: OutputFormat.UMD,
    },
  },
  {
    output: {
      file: packageJSON.jsdelivr,
      format: OutputFormat.IIFE,
    },
  },
  genOutPut(OutputFormat.AMD),
  genOutPut(OutputFormat.SYSTEM),
];

const buildConf = (options) => {
  return {
    ...commonConf,
    ...options,
  };
};

export default builds.map((output) => {
  return buildConf(output);
});

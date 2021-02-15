import { ufs } from "unionfs";
import { fs as memFs, Volume } from "memfs";
import * as fs from "fs";
import webpack from "webpack";
import Handlebars from "handlebars";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { resolve } from "path";
import { EOL } from "os";

const render = (name, base, opts) => {
  opts = opts || {
    data: {
      root: {},
    },
  };

  return new Handlebars.SafeString(
    Handlebars.compile(
      fs
        .readFileSync(
          resolve(process.cwd(), `../blueprints/${base}/${name}.hbs`)
        )
        .toString()
    )(opts.data.root)
  );
};

Handlebars.registerHelper("partial", function (content, opts) {
  return new Handlebars.SafeString(Handlebars.compile(content)(opts.data.root));
});

Handlebars.registerHelper("header", function (name, opts) {
  return render(name, "headers", opts);
});

Handlebars.registerHelper("footer", function (name, opts) {
  return render(name, "footers", opts);
});

Handlebars.registerHelper("layout", function (name, opts) {
  return render(name, "layouts", opts);
});

const panel = {
  components: [],
  routes: {
    index: {
      layout: "basic",
      content: fs
        .readFileSync("../../panel/routes/index/template.hbs")
        .toString(),
      script: fs.readFileSync("../../panel/routes/index/script.js").toString(),
    },
    about: {
      layout: "basic",
      content: fs
        .readFileSync("../../panel/routes/about/template.hbs")
        .toString(),
      script: fs.readFileSync("../../panel/routes/about/script.js").toString(),
    },
  },
};

const panelComponentFiles = fs.readdirSync("../../panel/components");

const componentFiles = fs.readdirSync("../components");

const createMemPath = (file) => {
  return `/mem/${file}`;
};

memFs.mkdirSync("/mem");
memFs.mkdirSync(createMemPath("/routes"));
memFs.mkdirSync(createMemPath("/pages"));
memFs.mkdirSync(createMemPath("/dist"));
memFs.mkdirSync(createMemPath("/components"));

const importScripts = [];

panelComponentFiles.forEach((file) => {
  const content = fs.readFileSync("../../panel/components/" + file).toString();
  panel.components.push(content);
  memFs.writeFileSync(createMemPath("/components/") + file, content);
  importScripts.push(`import '${createMemPath("components/" + file)}'`);
});

componentFiles.forEach((file) => {
  const content = fs.readFileSync("../components/" + file).toString();
  panel.components.push(content);
  memFs.writeFileSync(createMemPath("/components/") + file, content);
  importScripts.push(`import '${createMemPath("components/" + file)}'`);
});

const entries = {};
const htmlPlugins = [];
/*
memFs.writeFileSync(
  createMemPath("index.hbs"),
  fs.readFileSync(resolve(process.cwd(), "../blueprints/index.hbs"))
);*/

const compiled = Handlebars.compile(
  fs.readFileSync(resolve(process.cwd(), "../blueprints/index.hbs")).toString()
);

for (const name in panel.routes) {
  const route = panel.routes[name];

  memFs.writeFileSync(createMemPath(name + "-script.js"), route.script);

  memFs.writeFileSync(
    createMemPath(name + ".js"),
    `
    ${importScripts.join(EOL)}
    import './${name}-script.js';
  `
  );
  entries[name] = createMemPath(name + ".js");

  htmlPlugins.push(
    new HtmlWebpackPlugin({
      name: name,
      filename: resolve(process.cwd(), "../../dist/" + name + ".html"),
      templateContent: compiled(route),
      chunks: [name],
    })
  );
}

const compiler = webpack({
  mode: "development",
  entry: entries,
  resolve: {
    alias: {
      "lit-element": resolve(process.cwd(), "../../node_modules/lit-element"),
    },
  },
  output: {
    path: resolve(process.cwd(), "../../dist"),
    filename: "[name].js",
  },
  plugins: htmlPlugins,
});

ufs.use(memFs).use(fs);

compiler.outputFileSystem = fs;
compiler.inputFileSystem = ufs;

compiler.run((err, stats) => {
  if (err) {
    throw err;
  }

  console.log(
    stats.toString({
      colors: true,
      errorDetails: true,
    })
  );
  /*
  const content = fs.readFileSync(
    resolve(process.cwd(), "../../dist/index.html")
  );

  console.log(content);

   */
});

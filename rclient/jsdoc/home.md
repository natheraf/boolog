## JSDoc style guide

### Emojis

Emojis are used in descriptions to express functionality for functions or variables.

Listed below are some used with repeated expression.

| Emoji | Expresses                       |
| :---: | ------------------------------- |
|  🧩   | Components                      |
|  🔧   | Function or handlers for events |
|  🌐   | Global context                  |
|  👀   | Getters or fetchers             |
|  ✍️   | Update, write, sometimes delete |
|  💾   | Update, write, never delete     |
|  ➕   | Create new                      |
|  🎨   | Theme                           |
|  🌈   | Custom style                    |
|  🎩   | Custom styled components        |
|  ❗   | Custom styled for the required  |
|  🧹   | Delete or clear                 |
|  📦   | Static data                     |
|  🧭   | Navigating                      |
|  📍   | Locating                        |
|  📝   | React state or memo             |
|  ⚖️   | Comparator                      |
|  🔢   | Formatter                       |

JSDoc descriptions for pages should be wrapped in a `div` as shown below.

```
<div style="width: 75%">
<hr><h5>Description</h5>
...
<hr></div>
```

Sections can be divided into descriptions with titles given to each section. Each title can be formatted like so `<hr><h5>Your title</h5>`.

Feel free to look at written descriptions and sections as examples (e.g. Menu, in `Menu.js`).

### JSDoc Structure

JSDoc provides a number of tags to help give their docs structure. With how the project is implemented, the tags are used a bit differently. Below describes how these tags are used.

Modules are used as a way to group namespaces together. If there isn't a particular obvious place where a module can be written, there will be a file specifically made to house the module's documentation. Examples include the `index.js` written in `src/views/superAdmin`, `src/components`, and many others. Though those files have no purpose for our React app, they house the modules for JSDoc.

Getting JSDoc to structure properly with modules and namespaces written in different files, we use `@memberof` and specify where the namespace belongs. Then to show a namespace belongs to a module, we manually write `@link` tags in their module description.

Namespaces are used to name components, group functions, or a way of subdividing something in a module.

### Examples of structure

Each subdirectory in our source code directory will be its own module with a few exceptions.

Two examples of exceptions:

1. The assets directory does not require any documentation so there is no module written.

2. The views directory houses different modules, therefore isn't one.

We do not nest modules yet.

Two examples of directories that are modules:

1. The orders directory. This directory has a root page (`orders/Orders.js`) and many subsidiary pages that belong to it (`orders/SalesOrder` and `orders/Shipments.js`). Therefore, the best place to write a module where all subsidiary pages belong is in the root page `orders/Orders.js`.

2. The library directory. This directory does not have a root page. Therefore, we make a file where we can write our module (`index.js`).

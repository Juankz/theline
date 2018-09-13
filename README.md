# theline
An A-Frame game for js13k 2018. WebXR category

## Development

**Prerequisites**
- Node js https://nodejs.org/en/
- grunt-cli `npm install -g grunt-cli`
- Node serve `npm install -g serve`

**Running on local machine**

Use node serve command: `serve`. This will setup a server looking for an index.html file on the directory where was executed.

_If you try to open the index.html file on the browser without a server, it will not load any images or sounds._

**Distribution**

Use grunt-cli command: `grunt default`.

This will apply minification to files (js,html) and compresion to images (png,jpg,svg) and locates them inside the `dist/` folder. Aditionally creates a .zip file of the `dist/` folder.

**Warning**

The code of this project is quite messy, some portions are commented and understandable, some other may not. So use at your own risk

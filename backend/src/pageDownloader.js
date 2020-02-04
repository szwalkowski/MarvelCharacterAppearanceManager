const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = class {
  async downloadWindowFromUrlAsync(url) {
    let dom = await JSDOM.fromURL(url);
    return dom.window;
  };
};
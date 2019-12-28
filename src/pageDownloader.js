const jsdom = require("jsdom");
const {JSDOM} = jsdom;

let PageDownloader = function () {
};

PageDownloader.prototype.downloadWindowFromUrlAsync = async function (url) {
    let dom = await JSDOM.fromURL(url);
    return dom.window;
};

module.exports = PageDownloader;
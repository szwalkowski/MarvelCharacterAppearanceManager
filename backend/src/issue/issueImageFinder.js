const NodeCache = require("node-cache");
const JQuery = require("jquery");
const PageDownloader = require('../pageDownloader');

module.exports = class {
  #imageUrlCache;
  #pageDownloader;

  constructor() {
    this.#imageUrlCache = new NodeCache({
      stdTTL: 43200,
      checkperiod: 86400,
      useClones: false
    });
    this.#pageDownloader = new PageDownloader();
  }

  async getImageUrlForImageIdAsync(issueId, imageId) {
    const storedUrl = this.#imageUrlCache.get(imageId);
    if (storedUrl) {
      return storedUrl;
    }
    const pageForFileWithImage = await this.#pageDownloader.downloadWindowFromUrlAsync(`https://marvel.fandom.com/wiki/${issueId}`);
    const jQuery = new JQuery(pageForFileWithImage);
    const imageElement = jQuery.find("#templateimage a");
    const imageSrc = imageElement[0].attributes["href"].value.replace(/\?cb=.*/, "/scale-to-width-down/320");
    this.#imageUrlCache.set(imageId, imageSrc);
    return imageSrc;
  }

};
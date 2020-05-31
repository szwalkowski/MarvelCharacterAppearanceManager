module.exports = class {

  constructor(id, url, name, volume, issueNo, publishDateTimestamp, image, appearances) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.volume = volume;
    this.issueNo = issueNo;
    this.publishDateTimestamp = publishDateTimestamp;
    this.image = image;
    this.appearances = appearances;
  };
};
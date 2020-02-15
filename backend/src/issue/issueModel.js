module.exports = class {

  constructor(id, url, name, volume, issueNo, publishDateTimestamp, appearances) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.volume = volume;
    this.issueNo = issueNo;
    this.publishDateTimestamp = publishDateTimestamp;
    this.appearances = appearances;
  };

  markAsRead() {
    this.read = Date.now();
  };

  markAsNotRead() {
    this.read = null;
  };
};
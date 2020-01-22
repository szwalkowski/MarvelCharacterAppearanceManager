<template>
  <div id="paging-div" class="actions actions_top">
    <div class="nav">
      <label for="character-search">Character filter:</label>
      <input type="text" id="character-search" />
      <router-link tag="button" to="/add-new-character">
        Add new character
      </router-link>
      <button type="button" id="update-all-characters-button">
        Update all characters
      </button>
      <router-link tag="button" to="/appearances-types-dictionary">
        Dictionary for appearances
      </router-link>
    </div>
    <div id="pages-control-div">
      <select id="image-show-select" name="imagesShow">
        <option value="no-images" selected="selected">No images</option>
        <option value="only-character">Only character</option>
        <option value="all-images">VERY SLOW All images</option>
      </select>
      <button type="button" id="previous-page-button" class="paging-button">
        <img src="../../../public/img/prev-icon.svg" alt="prev-arrow" />
      </button>
      <label for="current-page">Current page:</label>
      <input type="number" id="current-page" />/
      <span id="total-page-count">1</span>
      <button type="button" id="next-page-button" class="paging-button">
        <img src="../../../public/img/next-icon.svg" alt="next-arrow" />
      </button>
      <label for="page-size-select">Page size:</label>
      <select id="page-size-select" name="pageSize">
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100" selected="selected">100</option>
        <option value="200">200</option>
        <option value="500">500</option>
        <option value="1000">1000</option>
        <option value="0">Use on your own risk</option>
      </select>
    </div>
  </div>
</template>

<template>
  <div>
    <div class="row bg-dark p-sm-3">
      <div class="text-center flex-fill">
        <label class="pr-sm-2" for="issue-filter">Search: </label>
        <input
          id="issue-filter"
          placeholder="Enter issue name"
          type="text"
          v-model="issueFilter"
        />
      </div>
    </div>
    <div
      class="text-center row bg-secondary p-sm-2 h-100"
      style="border: 1px dotted #82cc6f;"
      v-for="(volumePack, key) in issueList"
      :key="key"
    >
      <div class="col-sm my-auto font-weight-bold text-info">
        {{ key }}
      </div>
      <div class="col-sm my-auto text-center font-italic font-weight-bold">
        <div
          class="p-sm-1"
          v-for="(volume, volumeNo) in volumePack"
          :key="volumeNo"
        >
          <a
            v-if="volumeNo !== 'null'"
            :href="`/issue?issueName=${key}&issueVolume=${volumeNo}`"
          >
            {{ volumeNo }}
          </a>
          <a v-else :href="`/issue?issueName=${key}`">n/a</a>
          (Issue count: {{ volume.length }})
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      issueList: [],
      issueFilter: ""
    };
  },
  created() {
    axios
      .get("issues")
      .then(res => {
        this.issueList = res.data;
      })
      .catch(error => console.log(error));
  }
};
</script>

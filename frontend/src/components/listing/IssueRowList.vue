<template>
  <div
    class="text-center row bg-secondary p-sm-2 h-100"
    style="border: 1px dotted #82cc6f;"
  >
    <div class="col-sm my-auto font-weight-bold text-info">
      {{ element.name }}
    </div>
    <div class="col-sm my-auto text-center font-italic font-weight-bold">
      <div
        class="p-sm-1"
        v-for="(volumeCount, volumeNo) in element.volumePack"
        :key="volumeNo"
      >
        <router-link
          v-if="volumeNo !== 'null'"
          tag="a"
          :to="
            `/issue?issueName=${encodeURIComponent(
              element.name
            )}&issueVolume=${encodeURIComponent(volumeNo)}`
          "
        >
          Volume {{ volumeNo }} <small class="text-light">- ({{ volumeCount }})</small>
        </router-link>
        <router-link
          v-else
          :to="`/issue?issueName=${encodeURIComponent(element.name)}`"
        >
          Volume <small class="text-light">- ({{ volumeCount }})</small>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    element: {
      type: Object,
      required: true
    }
  }
};
</script>

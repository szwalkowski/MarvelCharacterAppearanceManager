<template>
  <div
    class="text-center row bg-secondary p-sm-2 h-100"
    style="border: 1px dotted #82cc6f;"
  >
    <div class="col-sm my-auto font-weight-bold text-info">
      {{ element.displayName }}
    </div>
    <div class="col-sm my-auto text-center font-italic font-weight-bold">
      <div
        class="p-sm-1"
        v-for="universe in element.universes"
        :key="universe.characterId"
      >
        <router-link
          tag="a"
          :to="
            `/character?characterId=${encodeURIComponent(universe.characterId)}`
          "
        >
          {{ universe.characterId | underscoresToSpaces }}
          <small class="text-light">- ({{ universe.numberOfIssues }})</small>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  filters: {
    underscoresToSpaces(value) {
      return value.replace(/_/g, " ");
    }
  },
  props: {
    element: {
      type: Object,
      required: true
    }
  }
};
</script>

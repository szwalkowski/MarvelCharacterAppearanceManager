<template>
  <div
    class="text-center row bg-secondary p-sm-2 h-100"
    style="border: 1px dotted #82cc6f;"
  >
    <a
      type="button"
      class="col-sm my-auto font-weight-bold text-info"
      @click="showIssueDetails(element.issueId)"
    >
      {{ element.issueId | removeDash }}
    </a>
    <div
      v-if="element.updateTime"
      class="col-sm my-auto text-center font-italic font-weight-bold"
    >
      <small>update time:</small> {{ element.updateTime }}
    </div>
  </div>
</template>
<script>
import IssuePreview from "./IssuePreview";

export default {
  filters: {
    removeDash(title) {
      return title.replace(/_/g, " ");
    }
  },
  props: {
    element: {
      type: Object,
      required: true
    }
  },
  methods: {
    showIssueDetails(issueId) {
      this.$modal.show(
        IssuePreview,
        { issueId },
        { height: "auto", scrollable: true, width: 1000 }
      );
    }
  }
};
</script>

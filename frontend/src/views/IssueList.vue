<template>
  <div>
    <PageableList
      :elementsList="issueList"
      paginatedElementComponent="IssueRowList"
      type="issue"
      :filterMethod="filter"
    />
  </div>
</template>
<script>
import PageableList from "../components/listing/PageableList";
import axios from "axios";

export default {
  components: {
    PageableList
  },
  data() {
    return {
      issueList: []
    };
  },
  created() {
    axios
      .get("issues")
      .then(res => {
        this.issueList = res.data;
      })
      .catch(error => console.log(error));
  },
  methods: {
    filter(issueList, filter) {
      const filterLowerCase = filter.toLowerCase();
      return this.issueList.filter(element =>
        element.name.toLowerCase().includes(filterLowerCase)
      );
    }
  }
};
</script>

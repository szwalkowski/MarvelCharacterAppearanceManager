<template>
  <div>
    <IconLoading v-if="isLoading" />
    <PageableList
      v-else
      :elementsList="issueList"
      paginatedElementComponent="IssueRowList"
      type="issue"
      :filterMethod="filter"
    />
  </div>
</template>
<script>
import IconLoading from "../components/icon/IconLoading";
import PageableList from "../components/listing/PageableList";
import axios from "axios";
import { mapGetters, mapMutations } from "vuex";

export default {
  components: {
    IconLoading,
    PageableList
  },
  data() {
    return {
      issueList: []
    };
  },
  computed: {
    ...mapGetters("loading", ["isLoading"])
  },
  created() {
    this.enableLoading();
    axios
      .get("issues")
      .then(res => {
        this.issueList = res.data;
      })
      .catch(error => console.log(error))
      .finally(() => {
        this.disableLoading();
      });
  },
  methods: {
    ...mapMutations("loading", ["disableLoading", "enableLoading"]),
    filter(issueList, filter) {
      const filterLowerCase = filter.toLowerCase();
      return this.issueList.filter(element =>
        element.name.toLowerCase().includes(filterLowerCase)
      );
    }
  }
};
</script>

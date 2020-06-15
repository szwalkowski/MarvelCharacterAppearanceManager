<template>
  <div class="container">
    <div class="row bg-dark p-sm-2 m-3">
      <div class="text-center flex-fill">
        <label class="pr-sm-2" for="filter">Search: </label>
        <input
          id="filter"
          :placeholder="`Enter ${type} name`"
          type="text"
          v-model="filter"
        />
      </div>
      <div class="form-group">
        <ul class="pagination">
          <li class="page-item" :class="currentPage === 0 ? 'disabled' : ''">
            <a
              class="page-link"
              href="javascript:void(0)"
              @click="decrementPage()"
            >
              &laquo;
            </a>
          </li>
          <input
            id="manualPageInput"
            v-model="manualPage"
            type="text"
            class="col-form-label-sm col-form-label-sm"
            :placeholder="currentPage + 1"
            @keyup.enter="changePage"
            @input="isNumber"
            @blur="manualPage = ''"
          />
          <label class="mt-sm-1" for="manualPageInput">
            of {{ pageCount }}
          </label>
          <li
            class="page-item"
            :class="currentPage === pageCount - 1 ? 'disabled' : ''"
          >
            <a
              class="page-link"
              href="javascript:void(0)"
              @click="incrementPage()"
            >
              &raquo;
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="container">
      <component
        v-for="(element, idx) in paginatedData"
        :key="idx"
        :element="element"
        :is="paginatedElementComponent"
      />
    </div>
  </div>
</template>
<script>
import IssueRowList from "@/components/listing/IssueRowList";
import CharacterRowList from "@/components/listing/CharacterRowList";

export default {
  components: {
    CharacterRowList,
    IssueRowList
  },
  props: {
    elementsList: {
      type: Array,
      required: true
    },
    paginatedElementComponent: {
      type: String,
      required: true
    },
    pageSize: {
      type: Number,
      default: 25
    },
    type: {
      type: String,
      required: true
    },
    filterMethod: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      currentPage: 0,
      manualPage: "",
      filter: ""
    };
  },
  computed: {
    filteredData() {
      let filteredElements = this.elementsList;
      if (this.filter) {
        filteredElements = this.filterMethod(this.elementsList, this.filter);
      }
      return filteredElements;
    },
    pageCount() {
      if (!this.filteredData.length) {
        return 1;
      }
      return Math.ceil(this.filteredData.length / this.pageSize);
    },
    paginatedData() {
      if (!this.elementsList.length) {
        return [];
      }
      const startingIssueIdx = this.currentPage * this.pageSize;
      return this.filteredData.slice(
        startingIssueIdx,
        startingIssueIdx + this.pageSize
      );
    }
  },
  methods: {
    incrementPage() {
      this.currentPage++;
      if (this.currentPage >= this.pageCount) {
        this.currentPage = this.pageCount - 1;
      }
    },
    decrementPage() {
      this.currentPage--;
      if (this.currentPage < 0) {
        this.currentPage = 0;
      }
    },
    changePage() {
      this.currentPage = this.manualPage - 1;
      this.manualPage = "";
    },
    isNumber() {
      this.manualPage = parseInt(this.manualPage);
      if (isNaN(this.manualPage)) {
        this.manualPage = "";
      }
      if (this.manualPage > this.pageCount) {
        this.manualPage = this.pageCount;
      }
    }
  }
};
</script>

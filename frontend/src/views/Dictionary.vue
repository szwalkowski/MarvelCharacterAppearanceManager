<template>
  <div>
    <div v-if="existingDictionary">
      <div class="issue-filter-div actions actions_top">
        <form>
          <button type="button">
            Save Dictionary
          </button>
          <label id="error-label" />
        </form>
      </div>
      <div class="dictionary-table">
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="text" />
                <button>+</button>
              </td>
              <td>
                <input type="text" />
              </td>
            </tr>
            <tr v-for="(row, rowIdx) in dictionary" :key="row.label">
              <td>
                <div>
                  <input type="text" :value="row.label" />
                  <button
                    class="remove-dictionary-record"
                    :value="row.label"
                    @click="removeRow(rowIdx)"
                  >
                    -
                  </button>
                </div>
              </td>
              <td>
                <div v-for="(value, valueIdx) in row.values" :key="value">
                  <input type="text" :value="value" />
                  <button :value="value" @click="removeValue(rowIdx, valueIdx)">
                    -
                  </button>
                </div>
                <div>
                  <input type="text" />
                  <button :value="row.label">+</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p>Not existing dictionary!</p>
    </div>
  </div>
</template>
<script>
import axios from "axios";

const existingDictionaries = ["appearanceType"];

export default {
  data() {
    return {
      existingDictionary: false,
      dictionaryId: undefined,
      dictionary: {}
    };
  },
  methods: {
    removeRow(rowIdx) {
      this.dictionary.splice(rowIdx, 1);
    },
    removeValue(rowIdx, valueIdx) {
      this.dictionary[rowIdx].values.splice(valueIdx, 1);
    }
  },
  created() {
    this.dictionaryId = this.$route.query.type;
    this.existingDictionary =
      existingDictionaries.indexOf(this.dictionaryId) > -1;
    axios
      .get("getDictionary", {
        params: {
          dictionaryId: this.dictionaryId
        }
      })
      .then(response => {
        this.dictionary = response.data;
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>

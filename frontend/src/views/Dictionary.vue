<template>
  <div>
    <div v-if="existingDictionary">
      <div class="actions row">
        <form class="form-group form-inline">
          <button type="button" class="btn btn-primary" @click="saveDictionary">
            Save Dictionary
          </button>
        </form>
      </div>
      <div v-if="errors.length" style="color: red">
        <b>Please correct the following error(s):</b>
        <br />
        <ul style="padding-left: 1rem">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <div class="row">
        <table class="table table-hover table-bordered table-sm">
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td scope="row">
                <div class="form-group form-inline form-control-sm">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm mr-1"
                    @click="addNewRow"
                  >
                    +
                  </button>
                  <input
                    type="text"
                    placeholder="Enter new label"
                    class="form-control-plaintext col-xl p-"
                    v-model.trim="newRow.label"
                  />
                </div>
              </td>
              <td>
                <div class="form-group form-inline form-control-sm">
                  <input
                    type="text"
                    placeholder="Enter value"
                    class="form-control-plaintext col-6"
                    v-model.trim="newRow.value"
                  />
                </div>
              </td>
            </tr>
            <tr v-for="(row, rowIdx) in dictionary" :key="row.label">
              <td scope="row">
                <div class="form-group form-inline form-control-sm">
                  <button
                    class="btn btn-primary btn-sm"
                    :value="row.label"
                    @click="removeRow(rowIdx)"
                    v-if="row.label !== '-hide-'"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    class="form-control-plaintext col-xl"
                    :value="row.label"
                    disabled
                  />
                </div>
              </td>
              <td>
                <div class="form-group form-inline form-control-sm">
                  <button
                    @click="addValueToRow(rowIdx, $event)"
                    class="btn btn-primary btn-sm"
                  >
                    +
                  </button>
                  <input
                    :ref="'newValueFor' + rowIdx"
                    type="text"
                    class="form-control-plaintext col-6"
                  />
                </div>
                <div
                  v-for="(value, valueIdx) in row.values"
                  :key="value"
                  class="form-group form-inline form-control-sm"
                >
                  <button
                    :value="value"
                    @click="removeValue(rowIdx, valueIdx)"
                    class="btn btn-primary btn-sm"
                  >
                    -
                  </button>
                  <input
                    :value="value"
                    type="text"
                    class="form-control-plaintext col-6"
                    disabled
                  />
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

const existingDictionaries = ["appearanceType", "focusType"];

export default {
  data() {
    return {
      errors: [],
      existingDictionary: false,
      dictionaryId: undefined,
      dictionary: {},
      newRow: {
        label: "",
        value: ""
      }
    };
  },
  methods: {
    removeRow(rowIdx) {
      this.dictionary.splice(rowIdx, 1);
    },
    removeValue(rowIdx, valueIdx) {
      this.dictionary[rowIdx].values.splice(valueIdx, 1);
    },
    addNewRow() {
      this.errors = [];
      const label = this.newRow.label;
      const value = this.newRow.value;
      if (!label) {
        this.errors.push("Label must be defined!");
      } else if (label.indexOf("_") > -1 || label.indexOf(",") > -1) {
        this.errors.push("Label can't contain underscore (_) nor comma (,)!");
      }
      if (!value) {
        this.errors.push("At least one value must be defined!");
      }
      if (this.dictionary.find(row => row.label === label)) {
        this.errors.push(`Label ${label} is already defined!`);
      }
      if (!this.errors.length) {
        this.dictionary.push({
          label: label,
          values: [value.trim().toUpperCase()]
        });
        this.newRow = { label: undefined, value: undefined };
      }
    },
    addValueToRow(rowIdx) {
      this.errors = [];
      const newValue = this.$refs[`newValueFor${rowIdx}`][0].value
        .trim()
        .toUpperCase();
      if (!newValue) {
        this.errors.push("Value is empty!");
      } else {
        this.dictionary.forEach(row => {
          if (row.values.find(value => value === newValue)) {
            this.errors.push(
              `${newValue} already is stored under ${row.label}`
            );
          }
        });
      }
      if (this.errors.length) {
        this.$refs[`newValueFor${rowIdx}`][0].value = newValue;
        window.scrollTo(0, 0);
      } else {
        this.dictionary[rowIdx].values.push(newValue);
        this.$refs[`newValueFor${rowIdx}`][0].value = "";
      }
    },
    saveDictionary() {
      axios
        .post(
          "saveDictionary",
          {
            dictionaryId: this.dictionaryId,
            dictionaryContent: this.dictionary
          },
          {
            mcamAuthenticated: true
          }
        )
        .then(() => {
          this.$alert("Dictionary save completed!");
        })
        .catch(error => {
          this.errors.push(error.response.data);
          console.error(error);
        });
    },
    loadDictionary() {
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
  },
  created() {
    this.loadDictionary();
  },
  beforeRouteUpdate(to, from, next) {
    next();
    this.loadDictionary();
  }
};
</script>
<style scoped>
thead tr th:first-child,
tbody tr td:first-child {
  width: 20rem;
  min-width: 20rem;
  max-width: 20rem;
  word-break: break-all;
}
input {
  width: max-content;
}
</style>

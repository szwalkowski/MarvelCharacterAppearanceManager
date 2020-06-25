<template>
  <div class="container">
    <h3 class="row">Thank you!</h3>
    <p class="row">
      I really appreciate that you want to help me maintain that page!
    </p>
    <p class="row">
      Right now I'm only checking if there are people like yourself! And find
      out if that page is welcomed.
    </p>
    <p class="row">I'm having one more question for you:</p>
    <div class="form-group row">
      <select class="custom-select w-50" v-model="wayOfHelp">
        <option value="none" selected="">How would you like to help me</option>
        <option value="oneTime">One time donation</option>
        <option value="patreon">Patreon</option>
        <option value="different">Different way</option>
      </select>
    </div>
    <textarea
      v-if="wayOfHelp === 'different'"
      v-model="howDifferent"
      placeholder="How different?"
      class="row col-form-label-sm col-form-label-sm w-50"
      @input="maxThousandSigns"
    />
    <button
      class="row btn btn-primary"
      :class="wayOfHelp === 'none' ? 'disabled' : ''"
      @click="sendAnalytics"
    >
      Send information
    </button>
  </div>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      wayOfHelp: "none",
      howDifferent: ""
    };
  },
  methods: {
    sendAnalytics() {
      axios.post("storeAnalytics", {
        event: {
          wayOfHelp: this.wayOfHelp,
          howDifferent: this.howDifferent
        }
      });
      this.wayOfHelp = "none";
    },
    maxThousandSigns() {
      if (this.howDifferent.length > 1000) {
        this.howDifferent = this.howDifferent.slice(0, 1000);
      }
    }
  }
};
</script>

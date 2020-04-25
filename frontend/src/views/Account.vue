<template>
  <div
    v-if="user"
    class="card horizontal"
    style="max-width:400px;margin:0 auto;"
  >
    <div class="card-stacked">
      <div class="card-content">
        <p>
          name:
          <strong>{{ user.displayName }}</strong>
          <br />email:
          <strong>{{ user.email }}</strong>
          <br />
          uid:
          <strong>{{ user.uid }}</strong>
          <br />provider:
          <strong class="teal-text">
            {{ user.providerData[0].providerId }}
          </strong>
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("user", ["user"])
  }
};
</script>

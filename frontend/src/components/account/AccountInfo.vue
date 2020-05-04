<template>
  <div class="card horizontal col-auto">
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
          <strong>
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

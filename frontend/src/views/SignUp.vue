<template>
  <form>
    <fieldset>
      <legend>Create account</legend>
      <div class="form-group">
        <label for="email">Login</label>
        <input
          type="text"
          class="form-control"
          id="login"
          placeholder="Enter login"
        />
      </div>
      <div class="form-group">
        <label for="email">Email address</label>
        <input
          type="email"
          class="form-control"
          id="email"
          aria-describedby="emailHelp"
          placeholder="(Optional) Enter email"
        />
        <small id="emailHelp" class="form-text text-muted">
          We'll never share your email with anyone else. It's optional for
          possibility to reset password.
        </small>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          class="form-control"
          id="password"
          aria-describedby="passwordHelp"
          placeholder="Password"
        />
        <small id="passwordHelp" class="form-text text-muted">
          We recommend to use password manager! Never repeat your password
          between apps.
        </small>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </fieldset>
  </form>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["userName"])
  },
  created() {
    if (this.userName) {
      this.$router.push("/account");
    }
  }
};
</script>

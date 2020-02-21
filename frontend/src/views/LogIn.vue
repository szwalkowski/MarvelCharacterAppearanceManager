<template>
  <fieldset>
    <form @submit.prevent="tryToLogIn">
      <legend>Sign in</legend>
      <div class="form-group">
        <label for="email">Email address</label>
        <input
          type="text"
          class="form-control"
          id="email"
          aria-describedby="emailHelp"
          placeholder="Enter email"
          @blur="$v.userSingInData.email.$touch()"
          v-model.trim="userSingInData.email"
          :class="{ 'is-invalid': $v.userSingInData.email.$error }"
        />
        <small
          v-if="!$v.userSingInData.email.required"
          id="emailHelp"
          class="form-text invalid-feedback"
        >
          Please provide an email
        </small>
        <small
          v-else-if="!$v.userSingInData.email.email"
          id="emailHelp"
          class="form-text invalid-feedback"
        >
          Please provide valid email
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
          @blur="$v.userSingInData.password.$touch()"
          v-model.trim="userSingInData.password"
          :class="{ 'is-invalid': $v.userSingInData.password.$error }"
        />
        <small
          v-if="!$v.userSingInData.password.required"
          id="passwordHelp"
          class="form-text invalid-feedback"
        >
          Please provide a password
        </small>
      </div>
      <div class="custom-control custom-checkbox">
        <input
          v-model="userSingInData.doNotLogOut"
          type="checkbox"
          class="custom-control-input"
          id="doNotLogOut"
        />
        <label class="custom-control-label" for="doNotLogOut">
          Do not log out
        </label>
      </div>
      <button
        :disabled="$v.userSingInData.$invalid"
        type="submit"
        class="btn btn-primary mt-sm-2"
      >
        Submit
      </button>
    </form>
    <br />
    <div v-if="errors.length" style="color: red">
      <ul style="padding-left: 1rem">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </div>
  </fieldset>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import axios from "axios";
import { required, email } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      errors: [],
      userSingInData: {
        email: null,
        password: null,
        doNotLogOut: false
      }
    };
  },
  computed: {
    ...mapGetters("user", ["userName"])
  },
  methods: {
    ...mapMutations("user", ["authUser"]),
    tryToLogIn() {
      this.errors = [];
      axios
        .post("logIn", {
          userSingInData: this.userSingInData
        })
        .then(response => {
          this.authUser({ userData: response.data });
          this.$alert("Login with success!").then(() => {
            this.$router.push("/account");
          });
        })
        .catch(error => {
          this.errors.push(error.response.data);
          console.error(error);
        });
    }
  },
  validations: {
    userSingInData: {
      email: {
        required,
        email
      },
      password: {
        required
      }
    }
  },
  created() {
    if (this.userName) {
      this.$router.push("/account");
    }
  }
};
</script>

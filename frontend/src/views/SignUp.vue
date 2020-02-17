<template>
  <fieldset>
    <div v-if="errors.length" style="color: red">
      <ul style="padding-left: 1rem">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </div>
    <form @submit.prevent="tryToSignUp">
      <legend>Create account</legend>
      <div class="form-group">
        <label for="userName">User name</label>
        <input
          type="text"
          class="form-control"
          aria-describedby="userNameHelp"
          id="userName"
          placeholder="Enter user name"
          @blur="$v.userSingUpData.userName.$touch()"
          v-model="userSingUpData.userName"
          :class="{ 'is-invalid': $v.userSingUpData.userName.$error }"
        />
        <small
          v-if="$v.userSingUpData.userName.$error"
          id="userNameHelp"
          class="form-text invalid-feedback"
        >
          User name must be between 6 and 32 characters. And only allows for
          a-zA-Z0-9_- characters.
        </small>
      </div>
      <div class="form-group">
        <label for="email">Email address</label>
        <input
          type="text"
          class="form-control"
          id="email"
          aria-describedby="emailHelp"
          placeholder="Enter email"
          @blur="$v.userSingUpData.email.$touch()"
          v-model="userSingUpData.email"
          :class="{ 'is-invalid': $v.userSingUpData.email.$error }"
        />
        <small
          v-if="!$v.userSingUpData.email.$error"
          id="emailHelp"
          class="form-text text-muted"
        >
          We'll never share your email with anyone else.
        </small>
        <small
          v-else-if="!$v.userSingUpData.email.required"
          id="emailHelp"
          class="form-text invalid-feedback"
        >
          Please provide an email
        </small>
        <small
          v-else-if="!$v.userSingUpData.email.email"
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
          @blur="$v.userSingUpData.password.$touch()"
          v-model="userSingUpData.password"
          :class="{ 'is-invalid': $v.userSingUpData.password.$error }"
        />
        <small
          v-if="!$v.userSingUpData.password.$error"
          id="passwordHelp"
          class="form-text text-muted"
        >
          We recommend to use password manager! Never repeat your password
          between apps.
        </small>
        <small
          v-else-if="!$v.userSingUpData.password.required"
          id="passwordHelp"
          class="form-text invalid-feedback"
        >
          Please provide a password
        </small>
        <small
          v-else-if="$v.userSingUpData.password.$error"
          id="passwordHelp"
          class="form-text invalid-feedback"
        >
          Password must be longer than 6 characters
        </small>
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm password</label>
        <input
          type="password"
          class="form-control"
          id="confirm-password"
          aria-describedby="passwordConfirmHelp"
          placeholder="Confirm password"
          @blur="$v.userSingUpData.confirmPassword.$touch()"
          v-model="userSingUpData.confirmPassword"
          :class="{ 'is-invalid': $v.userSingUpData.confirmPassword.$error }"
        />
        <small
          v-if="$v.userSingUpData.confirmPassword.$error"
          id="passwordConfirmHelp"
          class="form-text invalid-feedback"
        >
          Confirm password does not match
        </small>
      </div>
      <button
        :disabled="$v.userSingUpData.$invalid"
        type="submit"
        class="btn btn-primary"
      >
        Submit
      </button>
    </form>
  </fieldset>
</template>
<script>
import { mapGetters } from "vuex";
import axiosAuth from "../axios-auth";
import {
  required,
  email,
  minLength,
  helpers,
  maxLength,
  sameAs
} from "vuelidate/lib/validators";
const userNameRegex = helpers.regex("userNameRegex", /^[a-zA-Z0-9_-]*$/);

export default {
  data() {
    return {
      errors: [],
      userSingUpData: {
        userName: null,
        email: null,
        password: null,
        confirmPassword: null
      }
    };
  },
  computed: {
    ...mapGetters("user", ["userName"])
  },
  methods: {
    tryToSignUp() {
      this.errors = [];
      if (!this.errors.length) {
        axiosAuth
          .post(`accounts:signUp?key=${process.env.VUE_APP_FIREBASE_API_KEY}`, {
            email: this.userSingUpData.email,
            password: this.userSingUpData.password,
            returnSecureToken: true
          })
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            this.errors.push(err.response.data.error.message);
            console.error(err);
          });
      }
    }
  },
  validations: {
    userSingUpData: {
      userName: {
        required,
        minLen: minLength(5),
        maxLen: maxLength(32),
        userNameRegex
      },
      email: {
        required,
        email
      },
      password: {
        required,
        minLen: minLength(6)
      },
      confirmPassword: {
        sameAs: sameAs("password")
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

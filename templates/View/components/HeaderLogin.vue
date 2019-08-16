<template>
  <ul class="user_state">
    <!-- <li v-if="!auth">
        <router-link to="/register">Sign Up</router-link>
    </li>
    <li v-if="!auth">
        <router-link to="/login">Sign In</router-link>
    </li> -->
    <li v-if="auth">
        <v-menu
            v-model="menu"
            transition="slide-x-transition"
            :close-on-content-click="false"
            :nudge-width="200"
            offset-y
            bottom
          >
      <template v-slot:activator="{ on }">
         <!-- <v-btn class="user_btn" light small flat v-on="on">
            {{user.FirstName}} {{user.LastName}}
            <v-icon right dark>person</v-icon>
          </v-btn> -->
          <v-btn class="user_btn_fab" fab light small v-on="on">
              <v-icon>person</v-icon>
          </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-tile avatar>
            <!-- <v-list-tile-avatar>
              <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John">
            </v-list-tile-avatar> -->
            <v-list-tile-content>
              <v-list-tile-title>{{user.UserName}}</v-list-tile-title>
              <v-list-tile-sub-title>{{user.FirstName}} {{user.LastName}}</v-list-tile-sub-title>
            </v-list-tile-content>

          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="primary" class="user_btn" small outline flat @click="onLogout">Logout</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    </li>
  </ul>
</template>
<script>
export default {
    data(){
        return {
          menu: false,
        };
    },
    created(){
        this.$store.dispatch('fetchUser');
    },
   computed: {
      auth () {
        return this.$store.getters.isAuthenticated;
      },
      user (){
        return this.$store.getters.user;
      }
    },
    methods: {
      onLogout() {
        this.$store.dispatch('logout');
        this.$router.push("login");
      }
    }
}
</script>
<style scoped>
.user_state{
    position: absolute;
    right: 0;
    top: 0;
}
.user_btn{
  text-transform: unset;
}
.user_btn_fab{
  height: 30px;
  width: 30px;
}
</style>
<style>
.user_btn .v-icon--right{
  margin-left: 5px !important;
}
</style>




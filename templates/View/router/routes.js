const View = () => import('@/views/View.vue');

const routes = [
  {
    path: '/view',
    name: 'View',
    component: View,
    meta: {
      title: "View"
    },
    beforeEnter (to, from, next) {
      store.dispatch('fetchUser');
      if (store.state.UToken) {
        next();
      } else {
        next('/login');
      }
    }
  },
];


export default routes;

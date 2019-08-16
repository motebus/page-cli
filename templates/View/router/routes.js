const View = () => import('@/views/View.vue');

const routes = [
  {
    path: '/view',
    name: 'View',
    component: View,
    meta: {
      title: "View"
    }
  },
];


export default routes;

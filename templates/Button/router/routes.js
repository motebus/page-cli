const Button = () => import('@/views/Button.vue');

const routes = [
  {
    path: '/Button',
    name: 'Button',
    component: Button,
    meta: {
      title: "Button"
    }
  },
];


export default routes;

const Obj = () => import('@/views/Object.vue');

const routes = [
  {
    path: '/object',
    name: 'Object',
    component: Obj,
    meta: {
      title: "Object"
    }
  },
];


export default routes;

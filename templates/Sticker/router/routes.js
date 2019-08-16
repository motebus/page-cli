const Sticker = () => import('@/views/Sticker.vue');

const routes = [
  {
    path: '/Sticker',
    name: 'Sticker',
    component: Sticker,
    meta: {
      title: "Sticker"
    }
  },
];


export default routes;

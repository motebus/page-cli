const urt = [
  { name : 'UcLogin', data : {ddn: 'UC',topic: '',func: 'ucLogin',payload: ['ali', '123456']}},
  { name : 'CreateObj', data : {ddn: '>>obj-mms',topic: '',func: 'CreateObj',payload: { "uid": "KPLwd1Qh", "name": "newObject", "vpath": "", "file": "", "type": "object", "tag": "", "data": {} }}},
  { name : 'FindObj-1', data : {ddn: '>>obj-mms',topic: '',func: 'FindObj',payload: { condition: { uid : 'KPLwd1Qh', name: 'newObject'} }}},
  { name : 'FindObj-2', data : {ddn: '>>obj-mms',topic: '',func: 'FindObj',payload: { condition: { uid : 'KPLwd1Qh', name: {$regex: 'new.*'}} }}},
  { name : 'Sample1', data : {ddn: '>>stevenhsu',topic: 'nfc://01',func: '',payload: { data : 'test' }}},
  { name : 'getPosts', data : {ddn: '>>blog-mms',topic: 'blog://mms',func: 'getPosts',payload: {"tags":["#photo"]}}},
  { name : 'Echo', data : {ddn: '>>comm',topic: 'ddn://xxx',func: 'echo',payload: 'test'}}
];


export default urt;

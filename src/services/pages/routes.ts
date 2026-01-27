import { Router } from 'express';
const routes = Router();

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/download', (req, res) => {
  res.render('download');
});

routes.get('/test', (req, res) => {
  res.render('test');
});

export default routes;
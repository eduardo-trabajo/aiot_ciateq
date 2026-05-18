// En tu archivo server.js o donde configures Express
import { Server } from 'socket.io';
import http from 'http';
import app from './app.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado a sockets');
});


app.set('io', io); // importante para usarlo dentro de rutas






server.listen(3001, () => {
  console.log('🌐 Servidor escuchando en puerto 3001');
});

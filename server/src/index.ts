/**
 * @description Colyseus server entry point
 * @author Abyssal Forge
 * @version 1.0.0
 */
import http from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { DungeonRoom } from './rooms/DungeonRoom';
import { ArenaRoom } from './rooms/ArenaRoom';

const port = Number(process.env.PORT || 2567);
const app = express();
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// Register Rooms
gameServer.define('dungeon', DungeonRoom);
gameServer.define('arena', ArenaRoom);

// Register Colyseus monitor (useful for debugging)
app.use('/colyseus', monitor());

gameServer.listen(port).then(() => {
  console.log(`⚔️ Abyssal Forge server listening on ws://localhost:${port}`);
}).catch(e => {
  console.error("Server start error:", e);
});

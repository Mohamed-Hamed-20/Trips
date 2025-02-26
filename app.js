import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
//set directory dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
import express from "express";
import morgan from "morgan";
import * as indexRouter from "./modules/index.route.js";
import http from "http";
import connection from "./DB/connection.js";
import { globalError } from "./services/asyncHandler.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);

// setup port and the baseUrl
const port = process.env.PORT || 5000;
const baseUrl = process.env.BASEURL;
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

connection();

//Setup API Routing
app.use(`${baseUrl}/auth`, indexRouter.authRouter);
app.use(`${baseUrl}`, indexRouter.profileRoutes);
app.use(`${baseUrl}/users`, indexRouter.userRoutes);
// app.use(`${baseUrl}/product`, indexRouter.productRouter);

// Socket.io
app.use(`${baseUrl}/conversations`, indexRouter.conversationRoutes);
app.use(`${baseUrl}/messages`, indexRouter.messageRoutes);
initSocket(server);

app.use("*", (req, res, next) => {
  res.json("In-valid Routing Plz check url or method");
});

app.use(globalError);

server.listen(port, () => console.log(`App listening on port ${port}!`));

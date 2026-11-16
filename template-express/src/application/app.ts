import express from "express";
import connectDB from "../config/db";
import {publicApi} from "../route/public-api";
import {errorMiddleware} from "../middleware/error-middleware";
import {apiSecured} from "../route/api";

const app = express();
app.use(express.json());
connectDB();


app.use(publicApi);
app.use(apiSecured)


app.use(errorMiddleware)
export default app;
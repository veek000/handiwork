// Registers Convex Auth's HTTP routes (OAuth callbacks, token exchange, etc.).
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;

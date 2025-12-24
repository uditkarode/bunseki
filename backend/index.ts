import Router from "@koa/router";
import { getTokeniser } from "./utils";
import Koa from "koa";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import process from "process";
import JishoAPI from "unofficial-jisho-api";

class HttpError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

async function main() {
  const app = new Koa();
  const jisho = new JishoAPI();

  const portEnv = parseInt(process.env["PORT"]!);
  const port = !isNaN(portEnv) ? portEnv : 52523;

  const tokeniser = await getTokeniser();
  console.log("Obtained tokeniser");

  app.use(cors());
  app.use(bodyParser());

  // error handler
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.log(e);
      ctx.response.status = e instanceof HttpError ? e.code : 500;
      ctx.response.body =
        e instanceof HttpError ? e.message : "Something went wrong!";
      ctx.response.type = "json";
    }
  });

  // router
  const router = (() => {
    const r = new Router();

    // tokenise route
    r.post("/api/tokenise", async (ctx) => {
      if (!ctx.request.body) {
        throw new HttpError(415, "Received no string to tokenise");
      }

      const body: { str?: string } = ctx.request.body;
      if (!body.str) {
        throw new HttpError(400, "Received no string to tokenise");
      }

      ctx.response.status = 200;
      ctx.response.type = "json";

      ctx.response.body = tokeniser.tokenize(body.str!);
    });

    // details route
    r.post("/api/details", async (ctx) => {
      if (!ctx.request.body) {
        throw new HttpError(415, "Received no string to get details of");
      }

      const body: { str?: string } = ctx.request.body;
      if (!body.str) {
        throw new HttpError(400, "Received no string to get details of");
      }

      const details = await jisho.searchForPhrase(body.str!);

      ctx.response.status = 200;
      ctx.response.type = "json";

      ctx.response.body = details.data;
    });

    return r;
  })();

  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Running on port: ${port}`);
  app.listen({ port });
}

main();

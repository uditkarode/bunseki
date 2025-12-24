import Router from "@koa/router";
import { getTokeniser } from "./utils";
import Koa from "koa";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import process from "process";
import { setup as setupJmdict, kanjiBeginning, readingBeginning, type Word } from "jmdict-simplified-node";

class HttpError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

// Check if a string contains kanji
function containsKanji(str: string): boolean {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(str);
}

// Map JMDict Word to the expected frontend format
function mapWordToDetails(words: Word[]) {
  return words.map(word => ({
    slug: word.id,
    is_common: word.kanji.some(k => k.common) || word.kana.some(k => k.common),
    tags: word.kanji.flatMap(k => k.tags),
    jlpt: [], // JMDict doesn't include JLPT data - removed for performance
    japanese: [
      ...word.kanji.map((k, i) => ({
        word: k.text,
        reading: word.kana[i]?.text || word.kana[0]?.text || ""
      })),
      ...(word.kanji.length === 0 ? word.kana.map(k => ({
        word: k.text,
        reading: k.text
      })) : [])
    ],
    senses: word.sense.map(s => ({
      english_definitions: s.gloss.map(g => g.text),
      parts_of_speech: s.partOfSpeech,
      tags: s.misc,
      see_also: s.related,
      antonyms: s.antonym,
      source: s.languageSource,
      info: s.info
    })),
    attribution: {
      jmdict: true,
      jmnedict: false,
      dbpedia: ""
    }
  }));
}

async function main() {
  const app = new Koa();

  const portEnv = parseInt(process.env["PORT"]!);
  const port = !isNaN(portEnv) ? portEnv : 52523;

  // Initialize JMDict database
  console.log("Initializing JMDict database...");
  const jmdictPath = process.env["JMDICT_JSON"] || "jmdict-eng-3.6.1.json";
  const { db } = await setupJmdict("jmdict-db", jmdictPath, true);
  console.log("JMDict database ready");

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

      const searchStr = body.str!;
      let results: Word[];

      // Use kanji search if the string contains kanji, otherwise use reading search
      if (containsKanji(searchStr)) {
        results = await kanjiBeginning(db, searchStr, 5);
      } else {
        results = await readingBeginning(db, searchStr, 5);
      }

      ctx.response.status = 200;
      ctx.response.type = "json";
      ctx.response.body = mapWordToDetails(results);
    });

    return r;
  })();

  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Running on port: ${port}`);
  app.listen({ port });
}

main();


import kuromoji from "kuromoji";

export function getTokeniser() {
  return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>(
    (resolve, reject) => {
      kuromoji.builder({ dicPath: "./dict" }).build((err, tokeniser) => {
        if (err) reject(err);
        resolve(tokeniser);
      });
    }
  );
}

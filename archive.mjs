import YAML from "js-yaml";
import fs from "fs";

const yamls = [
  YAML.safeLoad(fs.readFileSync("./src/2.yaml", "utf8")),
  YAML.safeLoad(fs.readFileSync("./src/3.yaml", "utf8")),
  YAML.safeLoad(fs.readFileSync("./src/4.yaml", "utf8")),
  YAML.safeLoad(fs.readFileSync("./src/5.yaml", "utf8")),
  YAML.safeLoad(fs.readFileSync("./src/6.yaml", "utf8")),
  YAML.safeLoad(fs.readFileSync("./src/7.yaml", "utf8"))
];
const fileName = "dist/words.json";

const keyNormalizes = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  が: "か",
  ぎ: "き",
  ぐ: "く",
  げ: "け",
  ご: "こ",
  ざ: "さ",
  じ: "し",
  ず: "す",
  ぜ: "せ",
  ぞ: "そ",
  っ: "つ",
  だ: "た",
  ぢ: "ち",
  づ: "つ",
  で: "て",
  ど: "と",
  ば: "は",
  び: "ひ",
  ぶ: "ふ",
  べ: "へ",
  ぼ: "ほ",
  ぱ: "は",
  ぴ: "ひ",
  ぷ: "ふ",
  ぺ: "へ",
  ぽ: "ほ",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ"
};

const results = {};
yamls.forEach(file => {
  Object.keys(file).forEach(word => {
    const result = results[word] || { displays: [], themas: [] };
    file[word].displays.forEach(display => {
      if (result.displays.indexOf(display) > -1) {
        return;
      }

      result.displays.push(display);
    });
    if (file[word].themas) {
      file[word].themas.forEach(thema => {
        if (result.themas.indexOf(thema) > -1) {
          return;
        }

        result.themas.push(thema);
      });
    }

    results[word] = result;
  });
});

const findContains = word => {
  const contains = [];

  if (word.length <= 2) {
    return [word];
  }

  const words = [];
  const chunks = word.match(/./g);
  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 2; j <= chunks.length; j++) {
      words.push(chunks.slice(i, j).join(""));
    }
  }
  words.forEach(word => {
    if (results[word]) {
      contains.push(word);
    }
  });

  return contains;
};

const words = [];
Object.keys(results)
  .sort((left, right) => {
    if (left.length < right.length) return -1;
    if (left.length > right.length) return 1;
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  })
  .forEach(key => {
    const item = results[key];

    const word = key;
    const wordNormalize = key
      .match(/./g)
      .map(chunk => {
        const normalized = keyNormalizes[chunk];
        if (normalized) {
          return normalized;
        }
        return chunk;
      })
      .join("");

    const dataRenew = [word];
    if (word != wordNormalize) {
      dataRenew.push(wordNormalize);
    } else {
      dataRenew.push("");
    }
    dataRenew.push(findContains(word).length);

    words.push(dataRenew.concat(Object.values(item)));
  });

fs.writeFileSync(fileName, JSON.stringify(words));

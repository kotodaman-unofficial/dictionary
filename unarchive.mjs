import words from "./dist/words";
import YAML from "js-yaml";
import fs from "fs";

const dictionary = {
  "2.yaml": {},
  "3.yaml": {},
  "4.yaml": {},
  "5.yaml": {},
  "6.yaml": {},
  "7.yaml": {}
};
words.forEach(chunks => {
  let [word, need, combo, displays, themas] = chunks;

  const data = {};
  data.displays = displays;
  if (themas.length) {
    data.themas = themas;
  }

  dictionary[`${word.length}.yaml`][word] = data;
});

Object.entries(dictionary).forEach(([fileName, dictionary]) => {
  fs.promises.writeFile(`src/${fileName}`, YAML.safeDump(dictionary));
});

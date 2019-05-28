import timsort from "timsort";
const quicksort = timsort.sort || timsort;

import words from "../dist/words.json";

const wildcards = ["＿", " ", "　", "○", "Ｏ"];

const replaceWhiteSpaces = (word, whildcard = ".") => {
  return word.replace(
    new RegExp("[" + wildcards.join("") + "]", "g"),
    whildcard
  );
};

const normalizeOptions = (options, extraOptions = {}) => {
  const opts =
    typeof options === "string"
      ? { ...extraOptions, word: options }
      : { ...extraOptions, ...options };
  opts.strict = opts.strict || false;
  opts.mode = opts.mode || "left";
  opts.digit = opts.digit
    ? opts.digit.length !== undefined
      ? opts.digit
      : [opts.digit]
    : [];
  opts.digit = opts.digit.map(digit => Number(digit));
  opts.limit = opts.limit || 200;
  opts.offset = opts.offset || 0;
  opts.order = opts.order || "abc";
  opts.word = replaceWhiteSpaces(opts.word || "");
  opts.wordNormalized = (opts.word.match(/./g) || [])
    .map(chunk => keyNormalizes[chunk] || chunk)
    .join("");
  opts.deck =
    typeof opts.deck === "string"
      ? opts.deck.length
        ? opts.deck.match(/./g)
        : []
      : opts.deck || [];
  opts.wall = typeof opts.wall === "string" ? opts.split(",") : opts.wall;

  if (opts.word.match(/[^ぁ-ん.]/)) {
    throw new Error("ひらがな以外の検索は行なえません");
  }

  return opts;
};

const createTester = opts => {
  const key = opts.strict ? opts.word : opts.wordNormalized;
  switch (opts.mode) {
    case "right":
      return new RegExp(key + "$");
    case "left":
      return new RegExp("^" + key);
    case "exact":
      return new RegExp("^" + key + "$");
    default:
      return new RegExp(key);
  }
};

const cache = {};
const findContains = (data, word) => {
  const contains = [];

  if (word.length <= 2) {
    return contains;
  }

  const words = [];
  const chunks = word.match(/./g);
  for (let i = 0; i < chunks.length; i++) {
    for (let j = i + 2; j <= chunks.length; j++) {
      words.push(chunks.slice(i, j).join(""));
    }
  }
  words.forEach(word => {
    if (cache[word]) {
      contains.push(word);
    }
  });

  return contains;
};

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

const finder = (options, extraOptions = {}) => {
  const opts = normalizeOptions(options, extraOptions);
  const wordTester = createTester(opts);

  let count = 0;
  let rows = [];
  words.forEach(item => {
    let [word, wordNormalized, combo, displays, themas] = item;
    wordNormalized = wordNormalized || word;

    cache[word] = true;

    const key = opts.strict ? word : wordNormalized;
    if (!wordTester.test(key)) {
      return;
    }

    if (opts.thema) {
      if (opts.thema === true) {
        if (!themas.length) {
          return;
        }
      } else {
        let matched = false;

        let needles = opts.thema.forEach ? opts.thema : [opts.thema];
        needles.forEach(needle => {
          if (themas.indexOf(needle) > -1) {
            matched = true;
          }
        });

        if (!matched) {
          return;
        }
      }
    }

    if (opts.digit.length) {
      if (opts.digit.indexOf(word.length) === -1) {
        return;
      }
    }

    const row = { word, combo, displays, themas };

    count++;

    rows.push(row);
  });

  if (opts.order === "combo") {
    quicksort(rows, (a, b) => {
      if (a.combo > b.combo) return -1;
      if (a.combo < b.combo) return 1;

      return 0;
    });
  }

  rows = rows.slice(opts.offset, opts.offset + opts.limit);
  rows.forEach(row => {
    row.contains = findContains(words, row.word);
  });

  return { count, rows, opts };
};

finder.amulet = options => {
  const opts = normalizeOptions(options, { mode: "center" });
  const amulets = [
    "いきもの",
    "色",
    "学校の教科",
    "身体",
    "魚介",
    "三国志",
    "植物・キノコ",
    "自然地形",
    "天気",
    "鳥",
    "星",
    "野菜・果物",
    "哺乳類",
    "セガ"
  ];
  const summaries = {};
  amulets.forEach(thema => {
    summaries[thema] = {
      thema,
      digit2: [],
      digit3: [],
      other: []
    };
  });

  const wordTester = createTester(opts);
  words.forEach(item => {
    let [word, wordNormalized, combo, displays, themas] = item;
    wordNormalized = wordNormalized || word;
    if (!themas.length) {
      return;
    }
    if (!wordTester.test(wordNormalized)) {
      return;
    }

    const data = { word, wordNormalized, combo, displays, themas };
    themas.forEach(thema => {
      if (word.length === 2) {
        summaries[thema].digit2.push(data);
      } else if (word.length === 3) {
        summaries[thema].digit3.push(data);
      } else {
        summaries[thema].other.push(data);
      }
    });
  });
  return Object.values(summaries);
};
finder.board = (options, extraOptions) => {
  const opts = normalizeOptions(options, extraOptions);
  if (opts.word.length < 3) {
    throw new Error("３文字以上の盤面が必要です");
  }
  if (opts.wall) {
    const optsWithOutWall = { ...opts, wall: undefined };
    let wall = opts.wall.concat(6);
    const words = wall
      .map((index, i) => {
        const indexPrev = wall[i - 1] || 0;
        return opts.word.slice(indexPrev, Number(index) + 1);
      })
      .sort((a, b) => {
        if (a.length > b.length) return -1;
        if (a.length < b.length) return 1;
        return 0;
      })
      .reduce((results, word) => {
        if (word.length < 3) {
          return results;
        }
        return results.concat(finder.board(word, optsWithOutWall));
      }, []);
    return words;
  }

  const wordTesters = [];

  let lengths = [4, 5, 6, 7];
  if (opts.word.length === 3) {
    lengths = [3];
  } else if (opts.word.length === 4) {
    lengths = [3, 4, 5, 6, 7];
  }
  lengths.forEach(digit => {
    if (opts.word.length < digit) {
      return;
    }

    for (let index = 0; index <= opts.word.length - digit; index++) {
      const word = opts.word.slice(index, index + digit);
      wordTesters.push({
        index,
        length: digit,
        tester: createTester({ ...opts, word, strict: true, mode: "exact" })
      });
    }
  });

  let count = 0;
  let rows = [];
  words.forEach(item => {
    let [word, wordNormalized, combo, displays, themas] = item;
    let matched = {};
    if (
      !wordTesters.find(({ index, length, tester }) => {
        if (tester.test(word)) {
          matched = { index, length };
          return true;
        }
      })
    ) {
      return;
    }

    const need = [];
    const used = opts.word
      .slice(matched.index, matched.index + matched.length)
      .match(/./g)
      .filter(char => char !== ".");
    word.match(/./g).forEach(char => {
      const index = used.indexOf(char);
      if (index > -1) {
        used.splice(index, 1);
      } else {
        need.push(keyNormalizes[char] || char);
      }
    });

    if (opts.deck.length) {
      const deck = opts.deck.slice();
      let fullfilled = true;
      need.forEach(char => {
        const index = deck.indexOf(char);
        if (index > -1) {
          deck.splice(index, 1);
        } else {
          fullfilled = false;
        }
      });

      if (!fullfilled) {
        return;
      }
    }

    const row = { word, need, combo, displays, themas };

    count++;

    rows.push(row);
  });

  rows = rows.slice(opts.offset, opts.offset + opts.limit);

  quicksort(rows, (a, b) => {
    if (a.word.length > b.word.length) return -1;
    if (a.word.length < b.word.length) return 1;
    if (a.combo > b.combo) return -1;
    if (a.combo < b.combo) return 1;

    return 0;
  });

  rows.forEach(row => {
    row.contains = findContains(words, row.word);
  });

  return rows;
};

finder.indexOf = (board, word, last = false) => {
  board = replaceWhiteSpaces(board);

  let indexOf = -1;
  chunk: for (let i = 0; i < board.length; i++) {
    const chunks = board.slice(i, i + word.length);
    if (chunks.length < word.length) {
      break;
    }

    for (let j = 0; j < chunks.length; j++) {
      if (chunks[j] === ".") {
        continue;
      }

      if (chunks[j] !== word[j]) {
        continue chunk;
      }
    }
    indexOf = i;
    if (!last) {
      return i;
    }
  }
  return indexOf;
};

finder.parallelMerge = (board, word, last = false) => {
  board = replaceWhiteSpaces(board);
  const index = finder.indexOf(board, word, last);

  const merged = board.match(/./g).map((chunk, i) => {
    const inRange = index > -1 && i >= index;
    if (chunk === ".") {
      if (inRange) {
        const char = word[i - index];
        return ["", char];
      } else {
        return ["", ""];
      }
    }

    return [chunk, ""];
  });

  return { index, board: merged };
};

finder.normalizeMatch = (haystack = "", needle = "") => {
  haystack = haystack
    .match(/./g)
    .map(chunk => keyNormalizes[chunk] || chunk)
    .join("");
  needle = needle
    .match(/./g)
    .map(chunk => keyNormalizes[chunk] || chunk)
    .join("");

  return haystack.match(needle);
};

finder.need = (needle, words) => {
  needle = needle.match(/./g).map(chunk => keyNormalizes[chunk] || chunk);

  return words.filter(word => {
    const keys = word.need.slice();
    let fullfilled = true;
    needle.forEach(char => {
      const index = keys.indexOf(char);
      if (index > -1) {
        keys.splice(index, 1);
      } else {
        fullfilled = false;
      }
    });
    return fullfilled;
  });
};

finder.words = words;

export default finder;

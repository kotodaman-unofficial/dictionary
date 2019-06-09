import { strictEqual } from "assert";
import { deepEqual } from "assert-diff";

import finder from "../src";

it.setOptions({ concurrency: 1 });

describe("正常系", (it, describe) => {
  describe("デフォルトで濁音拗音等を区別しない", (it, describe) => {
    describe("前方一致", it => {
      it("「」 デフォルト200件まで", () => {
        const result = finder("");
        strictEqual(result.opts.limit, 200);
        strictEqual(result.count, finder.words.length);
        strictEqual(result.rows[0].word, "あい");
        strictEqual(result.rows[199].word, "かが");
        strictEqual(result.rows.length, result.opts.limit);
      });
      it("「」 199件から399件まで", () => {
        const result = finder("", { offset: 199 });
        strictEqual(result.opts.limit, 200);
        strictEqual(result.count, finder.words.length);
        strictEqual(result.rows[0].word, "かが");
        strictEqual(result.rows[199].word, "げげ");
        strictEqual(result.rows.length, result.opts.limit);
      });
      it("「」 6,7文字のみ", () => {
        const result = finder("", { digit: [6, 7] });
        strictEqual(result.opts.limit, 200);
        strictEqual(result.count, 105659);
        strictEqual(result.rows[0].word, "ああかあしゃ");
        strictEqual(result.rows[199].word, "あいづたじま");
      });
      it("「あいしょう」", () => {
        const result = finder("あいしょう");
        strictEqual(result.rows.length, 4);
        strictEqual(result.count, 4);
        strictEqual(result.rows[0].word, "あいしょう");
        strictEqual(result.rows[3].word, "あいしょうけん");
      });
      it("「あいＯょう」", () => {
        const result = finder("あいＯょう");
        strictEqual(result.rows.length, 15);
        strictEqual(result.rows[0].word, "あいきょう");
        strictEqual(result.rows[14].word, "あいしょうけん");
      });
      it("「た」お守り適正検索", () => {
        const result = finder("た", { thema: true });
        strictEqual(result.count, 569);
        strictEqual(result.rows.length, 200);
        strictEqual(result.rows[0].word, "たい");
        strictEqual(result.rows[199].word, "たっちゃん"); // 自然地形らしい
      });
      it("「た」天気のみ", () => {
        const result = finder("た", { thema: "天気" });
        strictEqual(result.rows.length, 11);
        strictEqual(result.rows[0].word, "たいふう");
        strictEqual(result.rows[10].word, "だすとすとおむ");
      });
      it("「と」自然地形か身体", () => {
        const result = finder("と", { thema: ["自然地形", "身体"] });
        strictEqual(result.rows.length, 34);
        strictEqual(result.rows[0].word, "とう");
        strictEqual(result.rows[1].word, "どう");
        strictEqual(result.rows[33].word, "どらいかんたあ"); // 三稜石のこと
      });
      it("「うこう」「うごう」コンボ数の確認", () => {
        const result = finder("こうこう", {
          mode: "exact",
          contains: true
        });
        strictEqual(result.rows[0].word, "こうこう");
        strictEqual(
          result.rows[0].contains.join("、"),
          "こう、こうこ、こうこう、こう"
        );
        strictEqual(result.rows[1].word, "こうごう");
        strictEqual(
          result.rows[1].contains.join("、"),
          "こう、こうご、こうごう、うご、うごう、ごう"
        );
      });
    });
    describe("後方一致", it => {
      it("「あいしょう」", () => {
        const result = finder("あいしょう", { mode: "right" });
        strictEqual(result.rows.length, 3);
        strictEqual(result.rows[0].word, "あいしょう");
        strictEqual(result.rows[2].word, "たちあいじょう");
      });
      it("「　　しき」", () => {
        const result = finder("　　しき", { mode: "exact" });
        strictEqual(result.rows.length, 145);
        strictEqual(result.rows[0].word, "あおしぎ");
        strictEqual(result.rows[141].word, "れいしき");
      });
    });
  });
  describe("濁音拗音等を区別する", (it, describe) => {
    describe("後方一致", it => {
      it("「あいし○う」", () => {
        const result = finder("あいし○う", {
          mode: "right",
          strict: true
        });
        strictEqual(result.rows.length, 2);
        strictEqual(result.rows[0].word, "あいしゅう");
      });
    });
    describe("あいまい", it => {
      it("「たいしょう」", () => {
        const result = finder("たいしょう", {
          mode: "center",
          strict: true
        });
        strictEqual(result.rows.length, 38);
        strictEqual(result.rows[0].word, "たいしょう");
        strictEqual(result.rows[37].word, "わかたいしょう");
      });
    });
  });
  describe("読み検索", it => {
    it("コラボのみ", () => {
      const result = finder("コラボ");
      strictEqual(result.count, 273);
      strictEqual(result.rows[0].word, "かい");
      strictEqual(result.rows[199].word, "さんじゅうし");
    });
  });
  describe("お守り適正検索", it => {
    it("だ（た）に一致するテーマの２文字の言葉が多い順に結果を返すべき", () => {
      const result = finder.amulet("だ");
      strictEqual(result.length, 14);
      strictEqual(result[0].thema, "いきもの");
      strictEqual(result[0].digit2.length, 10);
      strictEqual(result[0].digit2[0].word, "した");
    });
  });
  describe("盤面一致検索", it => {
    it("カナシミの盤面に適切な文字を返すべき", () => {
      const deck = "せすしういかゆうととまん";
      const result = finder.board("こ○○んど○○", { deck });
      strictEqual(result.length, 60);
      strictEqual(result[0].word, "こんぜんどうじ");
    });
    it("ハイアシンスの盤面に適切な文字を返すべき", () => {
      const deck = "みう";
      const result = finder.board("○○○りょう○", { deck });
      strictEqual(result.length, 4);
    });
    it("キョゼツの盤面に適切な文字を返すべき", () => {
      const deck = "こゆうしたんふたはまて";
      const result = finder.need(
        "し",
        finder.board("○○かい○○ん", { deck, wall: ["2", "3"] })
      );
      strictEqual(result.length, 66);
      strictEqual(result[0].word, "いしだん");
      strictEqual(result[65].word, "じゅか");
    });
    it("クリの盤面に適切な３文字をそれぞれの位置で返すべき", () => {
      const deck = "とあろいわうきまもみやさそ";
      const result = finder.board("○○か○く○じ", { deck, wall: ["2", "4"] });

      strictEqual(result.length, 38);

      const foundWords = result.map(item => item.word);
      strictEqual(foundWords[0], "あいか");
      strictEqual(foundWords[28], "かそく");
      strictEqual(foundWords[37], "くろじ");
    });
  });
  describe("言葉と盤面の依存関係を返すべき", it => {
    const flattenMergedBoard = board => {
      const left = [];
      const right = [];
      board.forEach(position => {
        const [leftChunk, rightChunk] = position;
        left.push(leftChunk || "　");
        right.push(rightChunk || "　");
      });

      return [left.join(""), right.join("")];
    };
    it("ういんどうず", () => {
      const { index, board } = finder.parallelMerge(
        "こ○○んど○○",
        "ういんどうず"
      );
      strictEqual(index, 1);

      const [left, right] = flattenMergedBoard(board);
      strictEqual(left, "こ　　んど　　");
      strictEqual(right, "　うい　　うず");
    });
    it("さとうがし", () => {
      const { index, board } = finder.parallelMerge("さ○○とう○○", "さとうがし");

      strictEqual(index, 2);

      const [left, right] = flattenMergedBoard(board);
      strictEqual(left, "さ　　とう　　");
      strictEqual(right, "　　さ　　がし");

      strictEqual(finder.parallelMerge("さ○○とう○○", "うとう", true).index, 4);
    });
    it("こうかく", () => {
      const { index, board } = finder.parallelMerge("こ○○くぼ○○", "こうかく");
      strictEqual(index, 0);

      const [left, right] = flattenMergedBoard(board);
      strictEqual(left, "こ　　くぼ　　");
      strictEqual(right, "　うか　　　　");
    });
  });
  it("文字を正規化してから一致するか確認すべき", () => {
    const [matched] = finder.normalizeMatch("ばびぶべぼ", "ぷ");
    strictEqual(matched, "ふ"); // 戻り値の正確性を保証しない
  });
});

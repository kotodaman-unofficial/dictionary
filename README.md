@kotodaman-unofficial/dictionary
---
<p align="right">
  <a href="https://www.npmjs.com/package/@kotodaman-unofficial/dictionary">
    <img alt="Npm version" src="https://badge.fury.io/js/%40kotodaman-unofficial%2Fdictionary.svg">
  </a>
  <a href="https://travis-ci.org/kotodaman-unofficial/dictionary">
    <img alt="Build Status" src="https://travis-ci.org/kotodaman-unofficial/dictionary.svg?branch=master">
  </a>
</p>

辞書データを内包したUMD形式のモジュールです。ブラウザ・NodeJS両方で使用できます。

> 使用例： https://kotononomicon.now.sh/

辞書データ
---

- http://unpkg.com/@kotodaman-unofficial/dictionary/dist/words.json

辞書データの１配列は
- `[ことば、使用する文字、コンボ数、表示、関連お守りテーマ]` というデータ構造になります
- （使用する文字が空欄 `""` の場合、代わりにことばを使用してください）

インストール
---

```bash
yarn add @kotodaman-unofficial/dictionary
```

```js
import kotodamanFinder from '@kotodaman-unofficial/dictionary'
```

もしくは

```html
<script src="http://unpkg.com/@kotodaman-unofficial/dictionary"></script>
<script>console.log(window.kotodamanFinder)</script>
```

API
---

くわしいオプションについては [./test/index.mjs](./test/index.mjs) を参考にしてください

# finder(word, opts = {}) => { count, rows, opts }

単語 `word` に一致する言葉を最大200件まで返します

# finder.amulet(word, opts = {}) => themas

頭文字 `word` に対し、テーマごとの言葉をグループ化して返します。２文字で作成できる言葉が多い順番テーマが優先されます。

# finder.board(board, opts = {}) => words

盤面 `board` に対し、 `opts.deck` で作成できる言葉を検索します。

# finder.parallelMerge(board, word) => parallelBoard (Experimental API (so buggy))

盤面 `board` に対し、 wordが作成できるばあいは `parallelBoard[0]` に盤面の文字、 `parallelBoard[1]` に `word` を合成した配列を返します

# finder.normalizeMatch(haystack, needle)

濁点、半濁点、拗音を無視して `haystack` が `needle` を含むかチェックします

# finder.need(needle, haystacks)

検索した言葉 `haystacks` に対し 必要文字 `needle` でさらに絞り込みをかけます

テスト
---
```bash
git clone git@github.com:kotodaman-unofficial/dictionary.git
cd dictionary

yarn
yarn build
npm start
```

License
---
MIT
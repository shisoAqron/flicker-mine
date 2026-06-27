# 実装依頼: スマホ向けフリック操作マインスイーパーゲーム

## 初期段階のゲームイメージ

proto-images ディレクトリにイメージ画像があります

## 1. 作りたいもの

スマホブラウザで遊べる、マインスイーパー派生のパズルゲームを作成してください。

通常のマインスイーパーのようにマスを直接タップして開くのではなく、盤面上にいる「つるはし」を上下左右にフリックして移動させ、未開封マスを掘っていくゲームです。

最終目的は、**地雷以外のすべてのマスを開けること**です。

GitHub Pages で公開する前提で、React + Vite + TypeScript を使って実装してください。

---

# 2. 技術スタック

## 必須

* Vite
* React
* TypeScript
* GitHub Pages で公開可能な静的ビルド
* `npm run build` で `dist` を生成
* GitHub Actions で `dist` を Pages にデプロイできる構成
* localStorage にベストスコア保存

## UI

React向けUIライブラリを使ってよいです。

推奨:

* shadcn/ui + Tailwind CSS
* または Mantine
* または React + CSS Modules / 通常CSS

ただし、**ゲーム盤面そのものはUIライブラリのTableやGridに依存せず、独自実装してください。**

UIライブラリは以下のような補助UIに使ってください。

* ボタン
* ダイアログ
* ヘルプ表示
* クリア表示
* ゲームオーバー表示
* 難易度選択
* トースト通知

---

# 3. 推奨プロジェクト構成

```text
/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  README.md
  src/
    main.tsx
    App.tsx
    styles/
      globals.css
    components/
      GameBoard.tsx
      Cell.tsx
      Hud.tsx
      BottomPanel.tsx
      GameResultDialog.tsx
      HelpDialog.tsx
    game/
      types.ts
      constants.ts
      boardGenerator.ts
      connectivity.ts
      movement.ts
      items.ts
      mineLogic.ts
      scoring.ts
      storage.ts
    hooks/
      useSwipe.ts
      useGame.ts
  public/
    favicon.svg
  .github/
    workflows/
      deploy.yml
```

ゲームロジックはReactコンポーネントに直書きせず、`src/game/` 配下に分離してください。

---

# 4. ゲーム概要

## 仮タイトル

* フリックマイン
* つるはしマイン

## コンセプト

数字ヒントを読みながら、つるはしをフリックで動かして安全マスを掘るマインスイーパー風パズル。

## 目的

地雷以外のすべてのマスを開けたらクリア。

## ゲームオーバー

すべてのつるはしが消滅したらゲームオーバー。

---

# 5. 盤面仕様

## MVP初期値

```ts
const BOARD_SIZE = 10;
const MINE_COUNT = 15;
const MAX_PICKAXES = 3;
const SPLIT_ITEM_COUNT = 2;
const BLAST_ITEM_COUNT = 1;
const SHIELD_ITEM_COUNT = 0;
```

## 難易度の初期イメージ

```text
かんたん:
- 8x8
- 地雷 8〜10
- 分裂アイテム 2
- 爆発アイテム 2

ふつう:
- 10x10
- 地雷 14〜18
- 分裂アイテム 2
- 爆発アイテム 1〜2

むずかしい:
- 12x12
- 地雷 25〜32
- 分裂アイテム 1〜2
- 爆発アイテム 0〜1
```

MVPでは、まず `10x10 / 地雷15 / 分裂2 / 爆発1` で実装してください。

---

# 6. 開始処理

## 開始地点選択

ゲーム開始時、プレイヤーは最初につるはしを置くマスを1つ選びます。

* 開始地点は必ず安全
* 可能なら開始地点の周囲8マスも安全
* 開始地点選択後に地雷配置を確定する方式でよい
* 開始地点は開封済みマスになり、つるはしが1本置かれる

## 初手安全保証

開始地点と周囲8マスには地雷を置かないでください。
初手事故は避けます。

---

# 7. 盤面生成

## 生成手順

1. 空の盤面を作る
2. プレイヤーが開始地点を選ぶ
3. 開始地点と周囲8マスを安全予約する
4. 安全予約マスを避けて地雷をランダム配置する
5. 地雷以外の安全マスが、開始地点から4方向連結しているか確認する
6. 連結していなければ盤面を作り直す
7. 各安全マスに、周囲8マスの地雷数を計算する
8. 安全マス上にアイテムを配置する

## 到達不能マス対策

生成時点で、地雷以外の全安全マスが開始地点から4方向移動で到達可能であることを確認してください。

```text
開始地点から到達できる安全マス数 === 全安全マス数
```

これを満たさない盤面は破棄して再生成してください。

これは「理不尽に到達不能な安全マス」をなくすための処理であり、パズルを簡単にするための処理ではありません。

完全に論理だけで解ける盤面保証まではMVPでは不要です。

---

# 8. マスの種類

各マスは以下の状態を持ちます。

## 基本状態

* 未開封
* 開封済み
* 隠れ地雷
* 露出地雷
* 爆発跡

## 内容

* 空白マス: 周囲地雷数が0
* 数字マス: 周囲地雷数が1以上
* 地雷マス
* 分裂アイテム
* 爆発アイテム
* シールドアイテム

MVPではシールドは未実装でも構いません。

---

# 9. つるはし仕様

## 基本

* 初期つるはしは1本
* 分裂アイテムによって最大3本まで増える
* つるはしはライフも兼ねる
* 1本でも残っていればゲーム続行
* すべて消滅したらゲームオーバー

## 複数つるはし

複数のつるはしが存在する場合でも、操作は1回のフリックだけです。

* 上フリック: すべてのつるはしが上方向に動く
* 下フリック: すべてのつるはしが下方向に動く
* 左フリック: すべてのつるはしが左方向に動く
* 右フリック: すべてのつるはしが右方向に動く

個別のつるはし選択は行いません。

操作は簡単にしつつ、複数つるはしの位置関係を考えるパズルにしてください。

---

# 10. フリック移動ルール

## 基本方針

つるはしはフリック方向に進みます。

進行中、マスの状態によって、通過・停止・開封・消滅が発生します。

---

## 10.1 開封済み空白マス

* 通過する
* 停止しない

---

## 10.2 開封済み数字マス

* そのマスに乗る
* そこで停止する

理由:

* 数字マスを中継地点として使えるようにするため
* 終盤に細かく位置調整しやすくするため
* 全安全マス開放を目指しやすくするため

---

## 10.3 未開封空白マス

* 掘る
* 開封済みになる
* つるはしはそのマスに入る
* そのまま同じ方向へ進み続ける

これは通常マインスイーパーの「0マス展開」に近い挙動です。

---

## 10.4 未開封数字マス

* 掘る
* 数字を表示する
* つるはしはその数字マスには乗らない
* 手前のマスで停止する

初めて数字を見つけた場合は、そこで情報を読むために停止するイメージです。

---

## 10.5 初発見数字マスと既存数字マスの違い

```text
初発見の数字マス:
- 開く
- つるはしは乗らない
- 手前で止まる

既に開いている数字マス:
- つるはしが乗れる
- そこで止まる
```

この仕様を明確に分けて実装してください。

---

## 10.6 未開封アイテムマス

* 掘る
* アイテムを取得する
* アイテム効果を即時発動する
* つるはしはそのマスに入る
* 原則として、そのまま同じ方向へ進み続ける

ただし、アイテム効果でつるはしが消滅した場合は、そのつるはしの移動を終了します。

---

## 10.7 隠れ地雷

つるはしが隠れ地雷を直接掘った場合:

* そのつるはしは消滅する
* そのマスは爆発跡または露出地雷として表示する
* そのつるはしの移動は終了する
* 他のつるはしが残っていればゲーム続行

MVPでは、直接掘った隠れ地雷は爆発跡として表示して構いません。

---

## 10.8 露出地雷

露出地雷にぶつかった場合:

* そのつるはしは消滅する
* 露出地雷が爆発する
* 周囲8マスを開放する
* 爆発で地雷が見つかった場合、その地雷は露出地雷になる
* MVPでは露出地雷同士の即時連鎖爆発はしない

これは「A案」として実装してください。

---

# 11. アイテム仕様

## 11.1 分裂アイテム

つるはしを増やすアイテムです。

仕様:

* 最大つるはし数は3本
* すでに3本いる場合は効果なし、またはスコア加算のみ
* 分裂アイテムを取ったつるはしはそのまま進む
* 新しく生成されたつるはしは、分裂アイテムを取得した地点に残る
* 次回以降のフリックでは、すべてのつるはしが同じ方向に動く

分裂は操作回数を増やさず、探索力と予備ライフを増やす要素です。

---

## 11.2 爆発アイテム

取得した瞬間に即時発動します。

仕様:

* 取得したつるはしの周囲8マスを対象にする
* 対象マスが安全マスなら開く
* 対象マスがアイテムなら開いて取得する
* 対象マスが地雷なら、爆発せず「露出地雷」状態にする
* 爆発アイテムを取得したつるはし自身は、この効果では消滅しない
* 複数つるはしがある場合でも、効果は取得したつるはしの周囲のみ
* 分裂で生まれたつるはしには爆発効果を引き継がない

爆発アイテムは、地雷を消すものではなく、地雷を見つける情報取得アイテムとして扱います。

---

## 11.3 シールドアイテム

MVPでは未実装でも構いません。

実装する場合:

* 取得したつるはしにシールドを付与する
* 次にそのつるはしが地雷または露出地雷にぶつかったとき、消滅を1回だけ防ぐ
* シールド使用後は解除される

---

# 12. 露出地雷仕様

露出地雷は、場所が見えている地雷です。

## 発生条件

* 爆発アイテムの周囲8マス開放効果で地雷が見つかった場合
* 露出地雷爆発の周囲8マス開放効果で地雷が見つかった場合

## 挙動

* 見える
* 安全マスとしては数えない
* 通行できない
* つるはしがぶつかると爆発する
* 爆発すると、ぶつかったつるはしは消滅する
* 周囲8マスを開放する
* その爆発でさらに地雷が見つかった場合は、即連鎖爆発せず、露出地雷として表示する

---

# 13. クリア条件

地雷以外のすべてのマスを開けたらクリアです。

```ts
openedSafeCells === totalSafeCells
```

宝石集めや一定マス数開放は、MVPのクリア条件にはしません。

マインスイーパーとしての軸を保つため、全安全マス開放をメイン目標にします。

---

# 14. ゲームオーバー条件

すべてのつるはしが消滅したらゲームオーバーです。

```ts
pickaxes.length === 0
```

---

# 15. スコア仕様

MVPでは簡単なスコアで構いません。

例:

```text
安全マスを開く: +10
数字マスを開く: +10
空白連続開放: コンボ加点
アイテム取得: +50
露出地雷発見: +30
クリアボーナス: +1000
残りつるはし数ボーナス: +500 × 残り本数
```

ベストスコアは localStorage に保存してください。

---

# 16. UI要件

## 上部UI

表示するもの:

* タイトル
* 現在スコア
* ベストスコア
* つるはし本数
* 地雷数
* 開放済み安全マス数 / 全安全マス数

---

## 中央UI

10x10盤面を表示します。

表示対象:

* 未開封マス
* 開封済み空白マス
* 数字マス
* 露出地雷
* 爆発跡
* つるはし
* 分裂アイテム
* 爆発アイテム
* シールドアイテム

---

## 下部UI

表示するもの:

* 操作説明
* 現在状態メッセージ
* リスタートボタン
* 難易度選択
* ヘルプボタン

文言例:

```text
上下左右にフリックして、つるはしを動かそう
数字は周り8マスの地雷数
地雷以外を全部開けたらクリア
```

---

# 17. 操作仕様

## スマホ

盤面エリア上のスワイプで方向を判定します。

* 横方向の移動量が大きければ左右
* 縦方向の移動量が大きければ上下
* 一定距離未満は無視

盤面には `touch-action: none;` を指定し、スワイプ時にページスクロールが暴発しないようにしてください。

## PC

テストしやすいように以下も対応してください。

* マウスドラッグでフリック判定
* キーボード矢印キー
* WASDキー

## 初期マス選択

ゲーム開始直後のみ、盤面の任意マスをタップして開始地点を決めます。

---

# 18. レイアウト

スマホ縦画面を前提にします。

```text
┌────────────────────┐
│ タイトル / スコア       │
├────────────────────┤
│ 10x10 盤面            │
│                    │
│                    │
├────────────────────┤
│ 操作説明 / ボタン       │
└────────────────────┘
```

盤面はスマホで見切れないようにします。

CSS例:

```css
.board {
  width: min(92vw, 420px);
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  touch-action: none;
}

.cell {
  min-width: 0;
  min-height: 0;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  font-weight: bold;
  user-select: none;
}
```

---

# 19. デザイン方針

テーマは、かわいい鉱山・地中探索パズルです。

## 色味

* 背景: 暗いブラウン、ネイビー、紫
* 未開封: 土ブロック
* 開封済み: 掘られた穴、石床
* 数字: 明るく見やすい色
* 露出地雷: 赤
* 爆発跡: 黒焦げ
* つるはし: 黄色または銀色
* アイテム: 光る色

## 仮アイコン

画像素材なしで、最初は絵文字やCSSアイコンで実装して構いません。

```text
つるはし: ⛏️
地雷: 💣
爆発: 💥
分裂: ✨
シールド: 🛡️
爆発アイテム: 🧨
```

10x10盤面で絵文字の視認性が悪い場合は、CSSアイコンや短い記号に置き換えてください。

---

# 20. 型定義案

```ts
export type Direction = "up" | "down" | "left" | "right";

export type GameStatus =
  | "waiting-start"
  | "playing"
  | "clear"
  | "gameover";

export type ItemType =
  | "split"
  | "blast"
  | "shield";

export type Cell = {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isExposedMine: boolean;
  isExplosionMark: boolean;
  adjacentMines: number;
  item: ItemType | null;
};

export type Pickaxe = {
  id: string;
  x: number;
  y: number;
  hasShield: boolean;
};

export type GameState = {
  board: Cell[][];
  pickaxes: Pickaxe[];
  status: GameStatus;
  score: number;
  bestScore: number;
  openedSafeCells: number;
  totalSafeCells: number;
  mineCount: number;
  message: string;
};
```

---

# 21. 状態管理

MVPでは Redux や Zustand は不要です。

React標準の `useReducer` を推奨します。

```ts
type GameAction =
  | { type: "START_AT"; x: number; y: number }
  | { type: "SWIPE"; direction: Direction }
  | { type: "RESTART" }
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty };
```

ゲームロジックは reducer から呼ぶ純粋関数に寄せてください。

---

# 22. 主要関数案

```ts
initGame()
handleStartCell(x, y)
generateBoard(startX, startY)
placeMines(startX, startY)
validateSafeConnectivity()
calculateAdjacentMines()
placeItems()

handleSwipe(direction)
moveAllPickaxes(direction)
movePickaxe(pickaxe, direction)
revealCell(x, y, pickaxe)
applyItem(cell, pickaxe)
applyBlastItem(pickaxe)
triggerExposedMine(exposedMineCell, pickaxe)

checkClear()
checkGameOver()
render()
saveBestScore()
```

---

# 23. 移動処理の擬似コード

```ts
function movePickaxe(pickaxe, direction) {
  let current = getCell(pickaxe.x, pickaxe.y);

  while (true) {
    const nextPos = getNextPosition(current.x, current.y, direction);

    if (!isInsideBoard(nextPos)) {
      // 盤面外には出ない。現在位置で停止。
      return;
    }

    const nextCell = getCell(nextPos.x, nextPos.y);

    if (nextCell.isExposedMine) {
      triggerExposedMine(nextCell, pickaxe);
      return;
    }

    if (nextCell.isRevealed) {
      if (nextCell.adjacentMines > 0) {
        // 既に開いている数字マスでは乗って停止
        pickaxe.x = nextCell.x;
        pickaxe.y = nextCell.y;
        return;
      }

      // 開封済み空白マスは通過
      pickaxe.x = nextCell.x;
      pickaxe.y = nextCell.y;
      current = nextCell;
      continue;
    }

    // 未開封マスを掘る
    if (nextCell.isMine) {
      removePickaxe(pickaxe);
      markExplosion(nextCell);
      return;
    }

    // 安全マスを開く
    revealCell(nextCell);

    if (nextCell.item) {
      pickaxe.x = nextCell.x;
      pickaxe.y = nextCell.y;
      applyItem(nextCell.item, pickaxe);

      if (!pickaxeStillExists(pickaxe)) {
        return;
      }

      current = nextCell;
      continue;
    }

    if (nextCell.adjacentMines === 0) {
      // 0マスは乗ってさらに進む
      pickaxe.x = nextCell.x;
      pickaxe.y = nextCell.y;
      current = nextCell;
      continue;
    }

    // 初発見の数字マスは、開くが乗らない
    // つるはしは手前の current に残る
    return;
  }
}
```

---

# 24. Reactコンポーネント責務

## App.tsx

* アプリ全体のレイアウト
* ゲーム状態の保持
* ヘルプや結果ダイアログの管理

## GameBoard.tsx

* 10x10盤面の描画
* スワイプイベントの受け取り
* 初期マス選択の受付
* 各Cellの描画

## Cell.tsx

1マス分の表示を担当。

## Hud.tsx

上部UIを担当。

## BottomPanel.tsx

下部UIを担当。

## GameResultDialog.tsx

クリア / ゲームオーバー時の結果表示。

## HelpDialog.tsx

ルール説明、アイテム説明、つるはし移動説明。

---

# 25. useSwipe仕様

`src/hooks/useSwipe.ts` を作成してください。

対応操作:

* touchstart / touchend
* pointerdown / pointerup
* keyboard Arrow keys / WASD

方向判定例:

```ts
const dx = endX - startX;
const dy = endY - startY;

if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
  return null;
}

if (Math.abs(dx) > Math.abs(dy)) {
  return dx > 0 ? "right" : "left";
}

return dy > 0 ? "down" : "up";
```

---

# 26. package.json

以下のスクリプトを用意してください。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

---

# 27. vite.config.ts

GitHub Pagesにリポジトリページとして公開する場合、`base` を設定してください。

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/REPOSITORY_NAME/",
});
```

`REPOSITORY_NAME` は実際のGitHubリポジトリ名に置き換えてください。

ユーザーサイト `https://USERNAME.github.io/` として公開する場合は `base: "/"` で構いません。

---

# 28. GitHub Pages デプロイ

GitHub Actions で `dist` を GitHub Pages に公開してください。

`.github/workflows/deploy.yml` を作成してください。

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

# 29. READMEに書くこと

READMEには以下を書いてください。

```text
## 概要

フリック操作でつるはしを動かし、地雷以外のマスをすべて開けるマインスイーパー派生パズルです。

## 操作方法

- 最初に開始マスを選ぶ
- 上下左右にフリックしてつるはしを動かす
- 0マスは進み続ける
- 初めて数字マスを掘ると手前で止まる
- 既に開いた数字マスでは乗って止まる
- 地雷にぶつかるとそのつるはしが消える
- すべてのつるはしが消えるとゲームオーバー
- 地雷以外を全部開けるとクリア

## 開発

npm install
npm run dev

## ビルド

npm run build

## プレビュー

npm run preview

## GitHub Pages公開

main ブランチに push すると GitHub Actions が実行され、dist が GitHub Pages に公開されます。

リポジトリ名を変更した場合は vite.config.ts の base を更新してください。
```

---

# 30. MVPでやらないこと

初期実装では以下はやらなくてよいです。

* 地面の硬さ
* 砂で滑る
* 岩で止まる
* 水晶反射
* 旗システム
* 完全な論理解保証ソルバー
* デイリーチャレンジ
* ランキング
* 複雑なアニメーション
* BGM/効果音
* 時限爆弾
* シールドの完全実装

まずは、ゲームルールが破綻せず、スマホでフリックして遊べることを優先してください。

---

# 31. 受け入れ条件

以下を満たせばMVP完了です。

1. Vite + React + TypeScript で実装されている
2. `npm run dev` でローカル起動できる
3. `npm run build` が成功する
4. `npm run preview` でビルド後の確認ができる
5. GitHub Actions で `dist` を GitHub Pages に公開できる
6. スマホ縦画面で10x10盤面が崩れず表示される
7. 最初に開始マスを選べる
8. 開始地点と周囲8マスが安全保証される
9. つるはしを上下左右フリックで動かせる
10. PCでは矢印キーまたはWASDでも動かせる
11. 開封済み空白マスは通過する
12. 初発見の数字マスでは、数字を開いて手前で止まる
13. 既存数字マスでは、その上に乗って停止する
14. 地雷を掘ると、そのつるはしが消滅する
15. すべてのつるはしが消えるとゲームオーバー
16. 分裂アイテムでつるはしが最大3本まで増える
17. 複数つるはしは同じフリック方向に同時移動する
18. 爆発アイテムで周囲8マスが開く
19. 爆発アイテムで地雷が見つかった場合、露出地雷になる
20. 露出地雷にぶつかると、そのつるはしが消滅し、周囲8マスが開く
21. 露出地雷爆発で見つかった地雷は、即連鎖爆発せず露出地雷になる
22. 地雷以外の全マスを開けるとクリア
23. スコアとベストスコアが表示される
24. ベストスコアが localStorage に保存される
25. リスタートできる
26. 盤面スワイプ時にページスクロールが暴発しない
27. 主要ゲームロジックがReactコンポーネントから分離されている

---

# 32. 実装優先順位

以下の順番で実装してください。

1. Vite + React + TypeScript のセットアップ
2. GitHub Pages向け build 設定
3. 10x10盤面の表示
4. 開始マス選択
5. 初手安全保証つき盤面生成
6. 地雷配置と数字計算
7. 安全マス連結チェック
8. つるはし表示
9. フリック操作
10. 単体つるはし移動
11. 空白マス通過
12. 初発見数字マス停止
13. 既存数字マス停止
14. 地雷衝突とつるはし消滅
15. クリア / ゲームオーバー判定
16. 分裂アイテム
17. 複数つるはし同時移動
18. 爆発アイテム
19. 露出地雷
20. スコア
21. localStorage
22. UI調整
23. README
24. GitHub Actionsデプロイ設定

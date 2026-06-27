# フリックマイン

フリック操作でつるはしを動かし、地雷以外のマスをすべて開けるマインスイーパー派生パズルです。

## 遊び方

1. 最初に開始マスを選ぶ
2. 上下左右にフリックしてつるはしを動かす
3. 0（空白）マスは進み続ける
4. 初めて数字マスを掘ると手前で止まる
5. 既に開いた数字マスでは乗って止まる
6. 地雷にぶつかるとそのつるはしが消える
7. すべてのつるはしが消えるとゲームオーバー
8. 地雷以外を全部開けるとクリア

## アイテム

- ✨ 分裂: つるはしを1本増やす（最大3本）
- 🧨 爆発: 周囲8マスを開放（地雷は露出させる）
- 🛡️ シールド: 次の地雷衝突を1回防ぐ

## 操作

- **スマホ**: 盤面上でスワイプ
- **PC**: 矢印キーまたは WASD キー、マウスドラッグ

## 開発

```sh
npm install
npm run dev
```

## ビルド

```sh
npm run build
```

## プレビュー

```sh
npm run preview
```

## GitHub Pages 公開

`main` ブランチに push すると GitHub Actions が実行され、`dist` が GitHub Pages に公開されます。

リポジトリ名を変更した場合は `vite.config.ts` の `base` を更新してください。

## 技術スタック

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- CSS Modules

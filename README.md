# volar-test

5 分くらいで思いついた架空のフロントエンドフレームワークを vscode で認識させる実装を試してみた.

## 試し方

1. vscode でこのルートを開く
2. `yarn` で依存関係をインストール (bun などを使わなかったのは node_modules 配下にシンボリックリンクを作るため)
3. `yarn build` で dist にコンパイル
4. vscode で `Launch Extension` を選択してデバッグ実行

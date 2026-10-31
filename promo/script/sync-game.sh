#!/usr/bin/env bash
# 把游戏本体（仓库根目录的三个文件）原样拷进 public/game/，片子里用 iframe 加载。
#
# 不改一个字节：片子里看到的界面就是 index.html + style.css + script.js 本身。
# 视频需要的「按帧驱动」全在 src/game/driver.ts 里从外部完成。
# 不用软链：Remotion 打包时会复制 public/，软链在不同环境下行为不一致。
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=..
mkdir -p public/game
for f in index.html style.css script.js; do
  [ -f "$ROOT/$f" ] || { echo "找不到 $ROOT/$f（promo/ 必须放在游戏仓库里）"; exit 1; }
  cp -f "$ROOT/$f" "public/game/$f"
done
echo "→ public/game/ ← index.html style.css script.js（$(cat public/game/*.{html,css,js} | wc -c) 字节）"

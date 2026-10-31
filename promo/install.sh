#!/usr/bin/env bash
# 幂等安装：依赖 → Remotion 浏览器 → 同步游戏本体 / 求解器数据 → 配乐 → 类型检查
# 重复跑没有副作用。
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Node / npm"; node -v; npm -v

# 有 lock 就严格按 lock 装；registry 跟随本机 ~/.npmrc，不硬编码
if [ -f package-lock.json ]; then
  echo "→ npm ci"
  npm ci --no-audit --no-fund
else
  echo "→ npm install"
  npm install --no-audit --no-fund
fi

echo "→ Remotion 浏览器"
npx remotion browser ensure

echo "→ 游戏本体 + 求解器数据"
./script/sync-game.sh
node script/gen-solver-data.mjs

echo "→ 配乐"
if [ -f public/music-60s.mp3 ]; then
  echo "  ✓ 已有 public/music-60s.mp3（换歌： ./script/prepare-audio.sh <音频文件>）"
else
  echo "  ! 缺 public/music-60s.mp3：配乐是第三方版权曲目，没有入库。"
  echo "    先放 60 秒静音占位，渲染能跑通；成片用的是 wenever.mp3："
  echo "      ./script/prepare-audio.sh path/to/wenever.mp3"
  ./script/prepare-audio.sh --silent
fi

echo "→ 类型检查"
npx tsc --noEmit

echo "就绪。npm run studio 预览，npm run preview 出 1080p，npm run render 出 4K60。"

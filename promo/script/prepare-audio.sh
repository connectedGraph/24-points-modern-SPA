#!/usr/bin/env bash
# 生成片子要的 60 秒配乐：public/music-60s.mp3
#
# 成片参数：取前 60 秒 → 两遍 loudnorm 到 -14 LUFS / 真峰值 -1.5 dBTP → 最后 1.6 秒淡出 → 320k CBR
# 切点锁在 112.906 BPM 的拍点上（src/lib/beats.ts），换歌必须重算。
#
# 用法：
#   ./script/prepare-audio.sh path/to/song.mp3     # 成片用的是 wenever.mp3
#   ./script/prepare-audio.sh --silent             # 60 秒静音占位（install.sh 用）
#
# 配乐不入库（第三方版权曲目），新克隆下来必须自己跑一次。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public
command -v ffmpeg >/dev/null || { echo "需要 ffmpeg / ffprobe"; exit 1; }

if [ "${1:-}" = "--silent" ]; then
  ffmpeg -v error -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 60 -c:a libmp3lame -b:a 96k public/music-60s.mp3
  echo "→ public/music-60s.mp3（60 秒静音占位；换歌： $0 path/to/song.mp3）"
  exit 0
fi

SRC=${1:-${MUSIC_SRC:-}}
[ -n "$SRC" ] || { echo "用法： $0 <音频文件>  |  $0 --silent"; exit 1; }
[ -f "$SRC" ] || { echo "找不到音频：$SRC"; exit 1; }

DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$SRC")
awk -v d="$DUR" 'BEGIN { if (d < 60) { print "音频只有 " d " 秒，不够 60 秒"; exit 1 } }'

# 第一遍：量
M=$(ffmpeg -hide_banner -nostats -t 60 -i "$SRC" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 |
  sed -n '/^{/,/^}/p')
get() { printf '%s' "$M" | sed -n "s/.*\"$1\" : \"\\([^\"]*\\)\".*/\\1/p"; }
MI=$(get input_i) MTP=$(get input_tp) MLRA=$(get input_lra) MTH=$(get input_thresh) OFF=$(get target_offset)
[ -n "$MI" ] || { echo "loudnorm 第一遍没量出来"; exit 1; }

# 第二遍：按量出来的值线性归一
ffmpeg -v error -y -t 60 -i "$SRC" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$MI:measured_TP=$MTP:measured_LRA=$MLRA:measured_thresh=$MTH:offset=$OFF:linear=true,afade=t=out:st=58.4:d=1.6" \
  -ar 44100 -c:a libmp3lame -b:a 320k public/music-60s.mp3

echo "→ public/music-60s.mp3（原曲 $MI LUFS → 目标 -14）"
ffprobe -v error -show_entries format=duration,bit_rate -of default=nw=1 public/music-60s.mp3

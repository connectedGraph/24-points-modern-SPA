# 24 Point · 60 秒宣传片

用 [Remotion](https://www.remotion.dev/) 做的 60 秒产品片，3840×2160 / 60fps。

片子里的游戏界面不是重画的：仓库根目录的 `index.html` + `style.css` + `script.js` 原样跑在 iframe 里，
由 `src/game/driver.ts` 按帧设置 `App.state`、再调用游戏自己的渲染函数
（`renderCards` / `updateText` / `updateHUD` / `showSettlement` / `calculate` / `showHistory` …）。
卡面上的分数、计算器里的解、去重镜头里的 292 条路径、打印页和导出的 Markdown，
全部是 `script.js` 真跑出来的（见 `script/gen-solver-data.mjs`）。

成片：3840×2160 / 60fps / 3600 帧 / 60.0s / H.264 High / 约 39MB / −14 LUFS。
本机（i5-13500H，并发 6）4K60 全片渲染 7 分多钟，1080p60 预览 2 分多钟。

| 段落 | 时间 | 内容 |
| --- | --- | --- |
| 开场 | 0 ~ 4.1s | 3 8 3 8 四张牌，凑 24？ |
| 主页 → 教学 | 4.1 ~ 16.9s | 拖卡 + 按住 WASD，8÷3=8/3 → 3−8/3=1/3 → 8÷1/3=24，最后一步落在 drop |
| 速通 | 16.9 ~ 21.1s | 挑战成功 → 下一关 6 2 1 3（A、W、W） |
| 主题 | 21.1 ~ 29.6s | 调色板 → 每拍换一套主题 / 卡面 → 6 实例主题墙 |
| 求解器 | 29.6 ~ 38.1s | 计算器 1 2 3 4 → 292 条递归路径按标准化哈希归成 4 个解 |
| 多语言 | 38.1 ~ 42.4s | 中 / 英 / 西 / 法 / 德 |
| 规则 | 42.4 ~ 48.8s | 声明无解、30 秒超时给参考解 |
| 记录 | 48.8 ~ 55.1s | 游戏记录 → 错题导出 Markdown → 打印练习卡 |
| 片尾 | 55.1 ~ 60s | 在线玩 / 源码二维码 |

## 用法

```bash
cd promo
./install.sh                                    # 幂等：npm ci → 浏览器 → 同步游戏 → 配乐占位 → 类型检查
./script/prepare-audio.sh path/to/wenever.mp3   # 成片配乐（不入库，见下）
npm run studio                                  # 预览 / 调时间轴
npm run preview                                 # 1080p60 快版 → out/preview-1080.mp4
npm run render                                  # 4K60 母版 → out/24-points-promo-60s-4k60.mp4
node script/stills.mjs 9.9 17.4 36.6            # 按秒抽帧审片 → out/stills/
node script/measure.mjs                         # 量游戏里各元素的坐标（机位、指针定点用）
```

`npm run studio / render / preview` 都会先跑 `npm run sync`：把根目录三个文件拷进 `public/game/`，
并重新生成 `src/generated/solver.json`。改了游戏本体，片子跟着变。

## 结构

```
script/
  sync-game.sh         根目录 index.html / style.css / script.js → public/game/（原样拷贝）
  gen-solver-data.mjs  在 node vm 里跑 script.js：题目的解、每条递归路径与哈希、合并结果、
                       printCards / exportMarkdown 的原始输出 → src/generated/solver.json
  prepare-audio.sh     取前 60 秒，两遍 loudnorm 到 -14 LUFS，末尾 1.6 秒淡出
  measure.mjs          CDP 量元素坐标
  stills.mjs           打包一次、抽多帧 PNG
src/
  lib/beats.ts         拍点网格（112.906 BPM，第 0 拍在 -0.118s，drop 在 16.887s）
  lib/story.ts         分镜单一真源：每一秒的游戏状态、指针轨迹、拖拽、机位
  game/driver.ts       把一帧的状态灌进 iframe 里的游戏（幂等，任意帧序都一样）
  game/GameFrame.tsx   一个游戏实例（iframe + 指针层）
  scenes/              开场、去重动画、主题墙、导出与打印、片尾
  components/          机位 Stage、左侧叠字 Panel、WASD 键帽等
```

## 按帧驱动的几个要点

- `script.js` 顶层是 `const` / `class`，不在 `window` 上；用 `iframe.contentWindow.eval('({ App, Fraction })')` 取。
- iframe 里所有 CSS `transition` 关掉，屏幕淡入淡出（原 0.3s ease）、调色板展开（原 0.2s）、
  倒计时条（原 30s linear）都由时间直接算；提示用的 `@keyframes pulse` 暂停后拨 `currentTime`。
- 悬停 / 按下：把 `style.css` 里所有 `:hover` / `:active` 规则复制一份到 `.__hover` / `.__active`，
  指针停在按钮上时加类名，样子就是游戏自己写的那个样子。
- 拖拽：卡片位置 = 卡槽位置 + 指针位移；松手前调游戏的 `checkOverlapHighlight` 决定蓝框高亮。
  合并按 `performOp` 的规则（新卡占目标卡槽），数值用游戏的 `Fraction`。
- 结算层、计算器输出、历史列表这些「显示过就留在 DOM 里」的内容，每帧都显式设一遍或清空，
  否则指针锚点（按钮位置）会随渲染顺序变化。
- 机位 `x` 不能小于 `960 / k`，否则画面左边露出页面以外（玻璃主题看不出，宣纸 / 暗血主题就是一条边）。

## 配乐

成片用的是 `wenever.mp3` 的前 60 秒（第三方版权曲目，只做剪辑，没有授权，**不入库**）。
新克隆下来 `install.sh` 会先放 60 秒静音占位；切点锁在拍点上，换歌要重算 `src/lib/beats.ts` 与 `story.ts` 的 `CUT`。

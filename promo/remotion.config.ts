import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
// 每个标签页里同时挂着 1~7 个游戏 iframe（主题墙那段最多），并发压到 6
Config.setConcurrency(6);
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setCrf(16);
Config.setOverwriteOutput(true);

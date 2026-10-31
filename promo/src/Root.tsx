import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { FPS, TOTAL_FRAMES } from './lib/beats';
import { H, W } from './lib/theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="Points24" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);

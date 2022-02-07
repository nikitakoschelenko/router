import React, { FC } from 'react';
import {
  View as VKUIView,
  ViewProps,
  Root as VKUIRoot,
  RootProps,
  Epic as VKUIEpic,
  EpicProps
} from '@vkontakte/vkui';

export const View: FC<
  Omit<ViewProps, 'activePanel' | 'history' | 'onSwipeback'>
> = (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <VKUIView {...props}>{props.children}</VKUIView>
);

export const Root: FC<Omit<RootProps, 'activeView'>> = (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <VKUIRoot {...props}>{props.children}</VKUIRoot>
);

export const Epic: FC<Omit<EpicProps, 'activeStory'>> = (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <VKUIEpic {...props}>{props.children}</VKUIEpic>
);

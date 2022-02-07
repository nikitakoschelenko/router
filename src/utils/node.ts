import { isValidElement, ReactNode } from 'react';
import {
  View as VKUIView,
  Root as VKUIRoot,
  Epic as VKUIEpic
} from '@vkontakte/vkui';

import { Epic, Root, View } from '../components';

export type NodeType = {
  type: 'view' | 'root' | 'epic' | null;
  key: 'activePanel' | 'activeView' | 'activeStory' | null;
};

export function getNodeType(node: ReactNode): NodeType {
  if (!isValidElement(node)) return { type: null, key: null };

  switch (node.type) {
    case View:
      return {
        type: 'view',
        key: 'activePanel'
      };

    case Root:
      return {
        type: 'root',
        key: 'activeView'
      };

    case Epic:
      return {
        type: 'epic',
        key: 'activeStory'
      };

    case VKUIView:
    case VKUIRoot:
    case VKUIEpic:
      console.warn(
        'Use View, Root and Epic imported from the router to work correctly.'
      );

    default:
      return {
        type: null,
        key: null
      };
  }
}

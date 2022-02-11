import { isValidElement, ReactNode } from 'react';
import {
  View as VKUIView,
  Root as VKUIRoot,
  Epic as VKUIEpic
} from '@vkontakte/vkui';
import { getNavId } from '@vkontakte/vkui/dist/lib/getNavId';

import { Epic, Root, View } from '../components';
import { NODE_ID_ATTRIBUTE } from '../constants';

export type NodeType = {
  type: 'view' | 'root' | 'epic' | null;
  key: 'activePanel' | 'activeView' | 'activeStory' | null;
  navID: string | null;
  nodeID: string | null;
};

export function getNodeType(node: ReactNode): NodeType {
  if (!isValidElement(node))
    return { type: null, key: null, navID: null, nodeID: null };

  let nodeID: string | null = node.props[NODE_ID_ATTRIBUTE] ?? null;
  let navID: string | null = getNavId(node.props) ?? null;

  switch (node.type) {
    case View:
      return {
        type: 'view',
        key: 'activePanel',
        navID,
        nodeID
      };

    case Root:
      return {
        type: 'root',
        key: 'activeView',
        navID,
        nodeID
      };

    case Epic:
      return {
        type: 'epic',
        key: 'activeStory',
        navID,
        nodeID
      };

    case VKUIView:
    case VKUIRoot:
    case VKUIEpic:
      console.warn(
        '[router] use View, Root and Epic imported from the router to work correctly.'
      );

    default:
      return {
        type: null,
        key: null,
        navID,
        nodeID
      };
  }
}

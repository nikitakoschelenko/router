import { isValidElement, ReactNode } from 'react';
import { getNavId } from '@vkontakte/vkui/dist/lib/getNavId';

import { NODE_ID_ATTRIBUTE } from '../constants';

export function getNavID(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return;

  return getNavId(node.props);
}

export function getNodeID(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return;

  return node.props[NODE_ID_ATTRIBUTE] as string;
}

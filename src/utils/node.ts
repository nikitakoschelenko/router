import { isValidElement, ReactNode } from 'react';
import { getNavId } from '@vkontakte/vkui/dist/lib/getNavId';

export const NODE_ID_ATTRIBUTE: string = 'data-node-id';

export function getNodeID(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return;

  return node.props[NODE_ID_ATTRIBUTE] as string;
}

export function getNavID(node: ReactNode): string | undefined {
  if (!isValidElement(node)) return;

  return getNavId(node.props);
}

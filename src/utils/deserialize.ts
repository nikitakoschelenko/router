import { Children, isValidElement, ReactNode } from 'react';

import { NODE_ID_ATTRIBUTE } from '../constants';
import { StringDict } from '../types';
import { getNodeType } from './node';

export function deserialize(root: ReactNode, pathname: string): StringDict {
  let deserialized: Record<string, string> = {};
  let chunks: string[] = pathname.split(/(?=\/)/);

  let currentWorkID: string | undefined = chunks.shift();

  function loop(node: ReactNode, parent: ReactNode): void {
    if (!isValidElement(node) || !isValidElement(parent)) return;

    let { navID } = getNodeType(node);
    let parentNodeID: string | undefined = parent.props[NODE_ID_ATTRIBUTE];

    if (navID && parentNodeID && currentWorkID === navID) {
      deserialized[parentNodeID] = navID;
      currentWorkID = chunks.shift();
    }

    if (node.props.children)
      Children.toArray(node.props.children).forEach((child) =>
        loop(child, navID ? node : parent)
      );
  }
  loop(root, root);

  return deserialized;
}

import React, { Children, FC, isValidElement } from 'react';
import {
  View as VKUIView,
  ViewProps,
  Root as VKUIRoot,
  RootProps,
  Epic as VKUIEpic,
  EpicProps,
  ModalRoot as VKUIModalRoot,
  ModalRootProps
} from '@vkontakte/vkui';

import { useParams } from './hooks';
import { back } from './router';
import { getNavId } from '@vkontakte/vkui/dist/lib/getNavId';

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

// modals
export const ModalRoot: FC<Omit<ModalRootProps, 'activeModal' | 'onClose'>> = (
  props
) => {
  let { modal = null } = useParams();

  return (
    <VKUIModalRoot activeModal={modal} onClose={back} {...props}>
      {props.children}
    </VKUIModalRoot>
  );
};

// popouts
export const PopoutRoot: FC = ({ children }) => {
  let { popout = null } = useParams();

  return (
    <>
      {Children.toArray(children).find(
        (node) => isValidElement(node) && getNavId(node.props) === popout
      )}
    </>
  );
};

import bridge from '@vkontakte/vk-bridge';
import { createPath, Location } from 'history';

export function setLocation(location: Location) {
  return bridge.send('VKWebAppSetLocation', {
    location: createPath(location),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    replace_state: true
  });
}

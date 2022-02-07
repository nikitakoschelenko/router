export function createNodeID(): string {
  let funny: string[] = [
    'some',
    'funny',
    'and',
    'unfunny',
    'words',
    'cringe',
    'bebra',
    'amogus',
    'vkid',
    'svgman',
    'arturfork',
    'vkterrorists'
  ];

  return (
    funny[Math.round(Math.random() * funny.length)] +
    '-' +
    Math.random().toString(36).substring(2, 15)
  );
}

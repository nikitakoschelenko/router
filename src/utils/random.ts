export function createNodeID(): string {
  // create random string
  return Math.random().toString(36).substring(2, 15);
}

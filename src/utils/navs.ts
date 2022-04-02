export type NavType = 'view' | 'root' | 'epic';

export type Nav = {
  type: NavType;
  navID: string;
  nodeID: string;
  availableTransitionIDs: string[];
  transitions: string[];
};

export function createNav(
  type: NavType,
  navID: string,
  availableTransitionIDs: string[],
  nodeID: string
): Nav {
  let firstTransition: string = availableTransitionIDs[0];

  return {
    type,
    navID,
    nodeID,
    availableTransitionIDs,
    transitions: [firstTransition]
  };
}

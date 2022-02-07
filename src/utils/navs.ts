export type NavType = 'view' | 'root' | 'epic';
export type NavID = string;
export type NavTransitionID = string;
export type NavTransition = string;
export type NavNodeID = string;

export type Nav = {
  type: NavType;
  navID: NavID;
  availableTransitionIDs: NavTransitionID[];
  transitions: NavTransition[];
  nodeID: NavNodeID;
};

export function createNav(
  type: NavType,
  navID: NavID,
  availableTransitionIDs: NavTransitionID[],
  nodeID: NavNodeID
): Nav {
  let firstTransition: string = availableTransitionIDs[0];

  return {
    type,
    navID,
    availableTransitionIDs,
    nodeID,
    transitions: [firstTransition]
  };
}

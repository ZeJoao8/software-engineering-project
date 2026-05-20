import { useEffect, useState } from "react";
import {
  getAcceptedFriendIds,
  getFriendshipStatus,
  getFriendshipWith,
  getPendingReceivedRequests,
  subscribeToFriendshipsChanges,
} from "../store/friends";

export function useFriends() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    return subscribeToFriendshipsChanges(() => setVersion(v => v + 1));
  }, []);

  return {
    getAcceptedFriendIds,
    getFriendshipStatus,
    getFriendshipWith,
    getPendingReceivedRequests,
  };
}

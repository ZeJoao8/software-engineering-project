import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
  where,
} from "firebase/firestore";

import { db } from "../infra/firebase";
import type { Report } from "../domain/entities/Report";

export async function save(report: Report): Promise<void> {
  await setDoc(doc(db, "reports", report.id), report);
}

export function subscribeByReporter(
  reporterId: string,
  onUpdate: (reports: Report[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, "reports"), where("reporterId", "==", reporterId)),
    snapshot => onUpdate(snapshot.docs.map(d => d.data() as Report)),
    onError
  );
}

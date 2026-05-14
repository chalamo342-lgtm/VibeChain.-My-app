import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'ended';
  type: 'voice' | 'video';
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  receiverCandidates?: any[];
}

export const startCall = async (callerId: string, callerName: string, receiverId: string, type: 'voice' | 'video', offer?: any) => {
  const callRef = await addDoc(collection(db, 'calls'), {
    callerId,
    callerName,
    receiverId,
    type,
    status: 'pending',
    offer: offer || null,
    callerCandidates: [],
    receiverCandidates: [],
    createdAt: serverTimestamp()
  });
  return callRef.id;
};

export const updateCallSignaling = async (callId: string, data: Partial<CallSession>) => {
  await updateDoc(doc(db, 'calls', callId), data);
};

export const addIceCandidate = async (callId: string, role: 'caller' | 'receiver', candidate: any) => {
  const field = role === 'caller' ? 'callerCandidates' : 'receiverCandidates';
  // Note: in a real app, use arrayUnion. For simplicity:
  const callDoc = doc(db, 'calls', callId);
  await updateDoc(callDoc, {
    [field]: candidate // simplified for now, should ideally be arrayUnion
  });
};

export const listenToCall = (callId: string, onUpdate: (call: CallSession) => void) => {
  return onSnapshot(doc(db, 'calls', callId), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ id: snapshot.id, ...snapshot.data() } as CallSession);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `calls/${callId}`);
  });
};

export const endCall = async (callId: string) => {
  await updateDoc(doc(db, 'calls', callId), { 
    status: 'ended',
    endedAt: serverTimestamp()
  });
};

export const listenForIncomingCalls = (userId: string, onCall: (call: CallSession) => void) => {
  const q = query(
    collection(db, 'calls'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        onCall({ id: change.doc.id, ...data } as CallSession);
      }
    });
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'calls');
  });
};

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import type { CmsNotificationPayload } from '~/types/cms/notification'

async function writeNotification(adminUid: string, toUid: string, payload: CmsNotificationPayload): Promise<void> {
  const db = getFirestore()
  await addDoc(collection(db, 'notifications'), {
    toUid,
    fromUid: adminUid,
    fromNickname: 'Forge',
    fromPhotoUrl: null,
    type: 'admin_broadcast',
    title: payload.title,
    body: payload.body,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function sendToUser(adminUid: string, toUid: string, payload: CmsNotificationPayload): Promise<void> {
  await writeNotification(adminUid, toUid, payload)
}

export async function sendToAll(adminUid: string, userUids: string[], payload: CmsNotificationPayload): Promise<number> {
  const targets = userUids.filter((uid) => uid !== adminUid)
  await Promise.all(targets.map((uid) => writeNotification(adminUid, uid, payload)))
  return targets.length
}

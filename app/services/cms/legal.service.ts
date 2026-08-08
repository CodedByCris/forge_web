import { getFirestore, doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import type { CmsLegalDocument, CmsLegalDocumentId } from '~/types/cms/legal'

const DOCUMENT_IDS: CmsLegalDocumentId[] = ['privacy_policy', 'terms_of_service']

function toDateOrNull(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null
}

export async function getLegalDocuments(): Promise<CmsLegalDocument[]> {
  const db = getFirestore()
  const results = await Promise.all(
    DOCUMENT_IDS.map(async (id) => {
      const snap = await getDoc(doc(db, 'legal_documents', id))
      const data = snap.data()
      return {
        id,
        contentHtml: data?.contentHtml ?? '',
        version: data?.version ?? 0,
        updatedAt: toDateOrNull(data?.updatedAt),
      }
    }),
  )
  return results
}

export async function saveLegalDocument(id: CmsLegalDocumentId, contentHtml: string, currentVersion: number): Promise<void> {
  const db = getFirestore()
  await setDoc(
    doc(db, 'legal_documents', id),
    {
      contentHtml,
      version: currentVersion + 1,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

import { useRouter } from 'vue-router'

/** Navigate only when the user clicks the summary background, not its action controls. */
export function useRecordNavigation() {
  const router = useRouter()
  function openRecords(context, dataset, event) {
    if (event?.target?.closest?.('a, button, input, select, textarea, label, [role="button"]')) return
    return router.push(`/${context}/records/${dataset}`)
  }
  return { openRecords }
}

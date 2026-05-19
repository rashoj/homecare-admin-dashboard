const CLOCK_RECORDS_KEY = "homecare_clock_records"

export function getClockRecords() {
  const savedRecords = localStorage.getItem(CLOCK_RECORDS_KEY)
  return savedRecords ? JSON.parse(savedRecords) : []
}

export function saveClockRecord(record) {
  const records = getClockRecords()
  const updatedRecords = [...records, record]

  localStorage.setItem(CLOCK_RECORDS_KEY, JSON.stringify(updatedRecords))

  return updatedRecords
}

export function updateClockRecord(recordId, updatedRecord) {
  const records = getClockRecords()

  const updatedRecords = records.map((record) =>
    record.id === recordId ? updatedRecord : record
  )

  localStorage.setItem(CLOCK_RECORDS_KEY, JSON.stringify(updatedRecords))

  return updatedRecords
}
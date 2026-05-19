export function saveCaregiverAuth(authData) {
  localStorage.setItem("caregiverToken", authData.token)
  localStorage.setItem(
    "caregiverUser",
    JSON.stringify({
      id: authData.id,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    })
  )
}

export function getCaregiverToken() {
  return localStorage.getItem("caregiverToken")
}

export function getCaregiverUser() {
  const user = localStorage.getItem("caregiverUser")

  return user ? JSON.parse(user) : null
}

export function clearCaregiverAuth() {
  localStorage.removeItem("caregiverToken")
  localStorage.removeItem("caregiverUser")
}
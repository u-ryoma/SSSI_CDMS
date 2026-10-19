const EDIT_ROLES = ["admin", "owner"]; // remove "owner" if only admin should edit

export const canEditSchedule = () =>
  EDIT_ROLES.includes((sessionStorage.getItem("role") || "").toLowerCase());

export const authHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
  ...extra,
});

import type { DeletedUser } from "@/types";

export function getReasonText(reason?: string | null): string {
  if (!reason || reason === null) return "Kein Grund angegeben";

  const reasonMap: Record<string, string> = {
    "No reason given": "Kein Grund angegeben",
    VIOLATION: "Regelverstoß",
    SELF_DELETION: "Eigene Löschung",
    ADMIN_DELETION: "Admin-Löschung",
    INACTIVITY: "Inaktivität",
  };

  return reasonMap[reason] || reason;
}
export function getReasonClass(reason?: string | null): string {
  if (!reason || reason === null) return "other";

  if (reason.includes("Regel") || reason.includes("VIOLATION")) return "violation";
  if (reason.includes("Eigene") || reason.includes("SELF")) return "self-deletion";
  if (reason.includes("Admin") || reason.includes("ADMIN")) return "admin-deletion";
  if (reason.includes("Inaktiv") || reason.includes("INACTIVITY")) return "inactivity";

  return "other";
}

export function getUserInitials(user: DeletedUser): string {
  const firstname = user.firstname || "";
  const lastname = user.lastname || "";

  if (firstname && lastname) {
    return (firstname[0] + lastname[0]).toUpperCase();
  } else if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return "??";
}

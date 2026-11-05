/** How a room is named inside the admin: its internal name if set, else the public name. */
export function roomLabel(room: { name: string; adminName?: string | null }): string {
  return room.adminName?.trim() || room.name;
}

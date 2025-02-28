import { roles } from "../../middleware/auth.js";

export const endPoints = {
  add: [roles.Admin, roles.Organizer],
  all: [roles.Admin, roles.Organizer, roles.User],
};

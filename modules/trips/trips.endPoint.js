import { roles } from "../../middleware/auth.js";

export const endPoints = {
  add: [roles.Admin],
  all: [roles.Admin, roles.User],
};

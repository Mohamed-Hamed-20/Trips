import { roles } from "../../middleware/auth.js"

export const endPoints = {
    add: [roles.Admin, roles.Guide],
    all : [roles.Admin, roles.Guide, roles.User]
}
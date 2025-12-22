import {Equipment, Role, Service, Station, Transactions, User} from "@/../prisma/generated/client"


type PermissionCheck<Key extends keyof Permissions> = boolean | ((user: User, data: Permissions[Key]["dataType"]) => boolean)

type RolesWithPermissions = {
    [R in Role]: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
        }>
    }>
}


type Permissions = {
    stations: {
        dataType: Station
        action: "view" | "create" | "update" | "delete"
    },
    equipments: {
        dataType: Equipment,
        action: "view" | "create" | "update" | "delete"
    }
    services: {
        dataType: Service,
        action: "view" | "create" | "update" | "delete"
    },
    transactions: {
        dataType: Transactions
        action: "view" | "create" | "update" | "delete"
    },

}

const ROLES = {
    ADMIN: {
        stations: {
            view: true,
            create: true,
            update: true,
            delete: true,
        },
        equipments: {
            delete: false
        }
    },
    ROOT: {},
    USER: {
        stations: {
            view: true,
            create: false,
            update: false,
            delete: false
        },
        equipments: {
            delete: false
        },
        transactions: {
            view: true,
            create: true,
            update: (user, transaction) => user.id === transaction.createCuid,
            delete: (user, transaction) => user.id === transaction.createCuid
        }
    }
} as const satisfies RolesWithPermissions


export function hasPermission<Resource extends keyof Permissions>(
    user: User,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
) {
    return [user.role].some(role => {

        if (role === 'ROOT') return true

        const permission = (ROLES as RolesWithPermissions)[role][resource]?.[action]

        if (permission == null) return false

        if (typeof permission === "boolean") return permission
        return data != null && permission(user, data)
    })
}
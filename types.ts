export type IUserJwt = {
    _id: string
    email: string
    name: string
    avatarUrl: string
    role: 'user'
    __v: number
    iat: number
    exp: number
}
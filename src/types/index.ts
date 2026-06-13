export type UserRole="contributor"|"maintainer";
export type IssuesType="bug"|"feature_request";
export type IssuesStatus="open"|"in_progress"|"resolved";

export interface IUser {
    id:number;
    name:string;
    email:string;
    password:string;
    role:UserRole;
    created_at:Date;
    updated_at:Date;
}

export interface IIssues{
    id:number;
    title:string;
    description:string;
    type:IssuesType;
    status:IssuesStatus;
    reporter_id:number;
    created_at:Date;
    updated_at:Date;

}

export interface IJwtPayload{
    id:number;
    name:string;
    role:UserRole;
}
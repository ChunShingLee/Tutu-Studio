export const adminPermissions = {
    metricsRead: 'metrics:read',
    usersRead: 'users:read',
    usersWrite: 'users:write',
    templatesRead: 'templates:read',
    templatesWrite: 'templates:write',
    settingsRead: 'settings:read',
    settingsWrite: 'settings:write',
    jobsRead: 'jobs:read',
    jobsWrite: 'jobs:write',
    subscriptionsRead: 'subscriptions:read',
    subscriptionsWrite: 'subscriptions:write',
    reviewsRead: 'reviews:read',
    reviewsWrite: 'reviews:write',
    auditsRead: 'audits:read'
};
export const allAdminPermissions = Object.values(adminPermissions);
export const operatorPermissions = [
    adminPermissions.metricsRead,
    adminPermissions.templatesRead,
    adminPermissions.templatesWrite,
    adminPermissions.jobsRead,
    adminPermissions.reviewsRead,
    adminPermissions.reviewsWrite,
    adminPermissions.auditsRead
];
export function hasPermission(permissions, permission) {
    return permissions.includes(permission);
}

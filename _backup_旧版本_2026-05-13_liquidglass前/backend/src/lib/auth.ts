export interface AuthenticatedAdmin {
  id: string;
  email: string;
  nickname: string;
  role: 'ADMIN' | 'OPERATOR';
  permissions: string[];
  status: 'ACTIVE' | 'DISABLED';
}

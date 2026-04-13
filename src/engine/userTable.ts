import { UserInfo } from '@/types';

const DEFAULT_USER: UserInfo = {
  username: 'user',
  uid: 1000,
  gid: 1000,
  groups: ['user', 'sudo'],
};

let currentUser: UserInfo = { ...DEFAULT_USER };
let isSudo = false;

export function getCurrentUser(): UserInfo {
  return { ...currentUser };
}

export function getIsSudo(): boolean {
  return isSudo;
}

export function setIsSudo(value: boolean): void {
  isSudo = value;
}

export function resetUser(): void {
  currentUser = { ...DEFAULT_USER };
  isSudo = false;
}

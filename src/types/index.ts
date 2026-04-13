export interface FSNode {
  type: 'file' | 'dir';
  content?: string;
  children?: Record<string, FSNode>;
  permissions?: string;
  owner?: string;
  group?: string;
}

export interface FileSystemTree {
  [key: string]: FSNode | FileSystemTree;
}

export interface StepData {
  title: string;
  description: string;
  content?: string;
  expectedCommand: string[];
  expectedOutput?: string;
  initialFS: FileSystemTree;
  initialCwd: string;
  interactive: boolean;
  readOnly?: boolean;
  hint?: string;
  customValidate?: (command: string, output: string, fs: any) => boolean;
}

export interface LessonMeta {
  key: string;
  slug: string;
  title: string;
  description: string;
  stepCount: number;
}

export interface ProcessEntry {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  command: string;
  state: string;
}

export interface UserInfo {
  username: string;
  uid: number;
  gid: number;
  groups: string[];
}

export interface ParsedCommand {
  command: string;
  flags: Record<string, boolean>;
  args: string[];
  raw: string;
  stdin?: string;
  redirect?: {
    type: '>' | '>>';
    target: string;
  };
}

export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
}

export interface ValidationResult {
  isSuccess: boolean;
  output: string;
  error?: string;
}

import { FSNode, FileSystemTree } from '@/types';
import cloneDeep from 'lodash/cloneDeep';

export class VirtualFilesystem {
  private tree: FileSystemTree;
  private cwd: string;
  private prevCwd: string;
  private homeDir: string = '/home/user';

  constructor(initialTree: FileSystemTree, initialCwd: string = '/home/user') {
    this.tree = cloneDeep(initialTree);
    this.cwd = initialCwd;
    this.prevCwd = initialCwd;
  }

  resolvePath(path: string): string {
    if (!path || path === '') {
      return this.cwd;
    }

    if (path === '~') {
      return this.homeDir;
    }

    if (path === '-') {
      return this.prevCwd;
    }

    let resolved: string;
    if (path.startsWith('/')) {
      resolved = path;
    } else {
      resolved = this.cwd === '/' ? `/${path}` : `${this.cwd}/${path}`;
    }

    const parts = resolved.split('/').filter(p => p !== '');
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '..') {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return '/' + normalized.join('/');
  }

  private getNodeAtPath(path: string): FSNode | null {
    const absolutePath = this.resolvePath(path);
    
    if (absolutePath === '/') {
      return { type: 'dir', children: this.tree as unknown as Record<string, FSNode> };
    }

    const parts = absolutePath.split('/').filter(p => p !== '');
    let current: FSNode = { type: 'dir', children: this.tree as unknown as Record<string, FSNode> };

    for (const part of parts) {
      if (current.type !== 'dir' || !current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  exists(path: string): boolean {
    return this.getNodeAtPath(path) !== null;
  }

  isDirectory(path: string): boolean {
    const node = this.getNodeAtPath(path);
    return node !== null && node.type === 'dir';
  }

  isFile(path: string): boolean {
    const node = this.getNodeAtPath(path);
    return node !== null && node.type === 'file';
  }

  pwd(): string {
    return this.cwd;
  }

  getCwd(): string {
    return this.cwd;
  }

  getTree(): FileSystemTree {
    return this.tree;
  }

  cd(path: string): { success: boolean; error?: string } {
    const targetPath = this.resolvePath(path);
    
    if (!this.exists(targetPath)) {
      return {
        success: false,
        error: `bash: cd: ${path}: No such file or directory`
      };
    }

    if (!this.isDirectory(targetPath)) {
      return {
        success: false,
        error: `bash: cd: ${path}: Not a directory`
      };
    }

    this.prevCwd = this.cwd;
    this.cwd = targetPath;
    return { success: true };
  }

  ls(path: string = '.', flags?: { l?: boolean; a?: boolean }): string {
    const targetPath = this.resolvePath(path);
    
    if (!this.exists(targetPath)) {
      throw new Error(`ls: cannot access '${path}': No such file or directory`);
    }

    if (!this.isDirectory(targetPath)) {
      throw new Error(`ls: ${path}: Not a directory`);
    }

    const node = this.getNodeAtPath(targetPath);
    if (!node || !node.children) {
      return '';
    }

    let entries = Object.keys(node.children);

    if (!flags?.a) {
      entries = entries.filter(name => !name.startsWith('.'));
    }

    entries.sort();

    if (flags?.l) {
      return entries.map(name => {
        const child = node.children![name];
        const type = child.type === 'dir' ? 'd' : '-';
        const perms = child.permissions || 'rwxr-xr-x';
        const size = child.type === 'file' ? (child.content?.length || 0) : 4096;
        return `${type}${perms}  1 user user ${size} Mar 31 10:30 ${name}`;
      }).join('\n');
    }

    return entries.join('  ');
  }

  mkdir(path: string, recursive: boolean = false): void {
    const absolutePath = this.resolvePath(path);
    
    if (this.exists(absolutePath)) {
      throw new Error(`mkdir: cannot create directory '${path}': File exists`);
    }

    const parts = absolutePath.split('/').filter(p => p !== '');
    const dirName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    if (!this.exists(parentPath)) {
      if (recursive) {
        this.mkdir(parentPath, true);
      } else {
        throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
      }
    }

    if (!this.isDirectory(parentPath)) {
      throw new Error(`mkdir: cannot create directory '${path}': Not a directory`);
    }

    const parentNode = this.getNodeAtPath(parentPath);
    if (parentNode && parentNode.type === 'dir' && parentNode.children) {
      parentNode.children[dirName] = { type: 'dir', children: {} };
    }
  }

  touch(path: string): void {
    const absolutePath = this.resolvePath(path);
    
    if (this.exists(absolutePath)) {
      if (this.isDirectory(absolutePath)) {
        throw new Error(`touch: cannot touch '${path}': Is a directory`);
      }
      return;
    }

    const parts = absolutePath.split('/').filter(p => p !== '');
    const fileName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    if (!this.exists(parentPath)) {
      throw new Error(`touch: cannot touch '${path}': No such file or directory`);
    }

    if (!this.isDirectory(parentPath)) {
      throw new Error(`touch: cannot touch '${path}': Not a directory`);
    }

    const parentNode = this.getNodeAtPath(parentPath);
    if (parentNode && parentNode.type === 'dir' && parentNode.children) {
      parentNode.children[fileName] = { type: 'file', content: '' };
    }
  }

  cat(path: string): string {
    const absolutePath = this.resolvePath(path);
    
    if (!this.exists(absolutePath)) {
      throw new Error(`cat: ${path}: No such file or directory`);
    }

    if (this.isDirectory(absolutePath)) {
      throw new Error(`cat: ${path}: Is a directory`);
    }

    const node = this.getNodeAtPath(absolutePath);
    return node?.content || '';
  }

  writeFile(path: string, content: string, append: boolean = false): void {
    const absolutePath = this.resolvePath(path);
    
    if (this.exists(absolutePath) && this.isDirectory(absolutePath)) {
      throw new Error(`bash: ${path}: Is a directory`);
    }

    const parts = absolutePath.split('/').filter(p => p !== '');
    const fileName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    if (!this.exists(parentPath)) {
      throw new Error(`bash: ${path}: No such file or directory`);
    }

    const parentNode = this.getNodeAtPath(parentPath);
    if (parentNode && parentNode.type === 'dir' && parentNode.children) {
      const existingFile = parentNode.children[fileName];
      if (existingFile) {
        if (append) {
          existingFile.content = (existingFile.content || '') + content;
        } else {
          existingFile.content = content;
        }
      } else {
        parentNode.children[fileName] = { type: 'file', content };
      }
    }
  }

  rm(path: string, recursive: boolean = false, force: boolean = false): void {
    const absolutePath = this.resolvePath(path);
    
    if (absolutePath === '/') {
      throw new Error(`rm: cannot remove '/': Permission denied`);
    }

    if (!this.exists(absolutePath)) {
      if (!force) {
        throw new Error(`rm: cannot remove '${path}': No such file or directory`);
      }
      return;
    }

    const node = this.getNodeAtPath(absolutePath);
    
    if (node?.type === 'dir' && !recursive) {
      throw new Error(`rm: cannot remove '${path}': Is a directory`);
    }

    const parts = absolutePath.split('/').filter(p => p !== '');
    const itemName = parts.pop()!;
    const parentPath = '/' + parts.join('/');

    const parentNode = this.getNodeAtPath(parentPath);
    if (parentNode && parentNode.type === 'dir' && parentNode.children) {
      delete parentNode.children[itemName];
    }
  }

  cp(src: string, dest: string, recursive: boolean = false): void {
    const srcPath = this.resolvePath(src);
    if (!this.exists(srcPath)) {
      throw new Error(`cp: cannot stat '${src}': No such file or directory`);
    }

    const srcNode = this.getNodeAtPath(srcPath);
    if (!srcNode) return;

    if (srcNode.type === 'dir' && !recursive) {
      throw new Error(`cp: -r not specified; omitting directory '${src}'`);
    }

    const destPath = this.resolvePath(dest);
    const cloned = cloneDeep(srcNode);

    if (this.exists(destPath) && this.isDirectory(destPath)) {
      const srcName = srcPath.split('/').pop()!;
      const parentNode = this.getNodeAtPath(destPath);
      if (parentNode?.type === 'dir' && parentNode.children) {
        parentNode.children[srcName] = cloned;
      }
      return;
    }

    const destParts = destPath.split('/').filter(p => p !== '');
    const destName = destParts.pop()!;
    const destParent = '/' + destParts.join('/');

    if (!this.exists(destParent) || !this.isDirectory(destParent)) {
      throw new Error(`cp: cannot create '${dest}': No such file or directory`);
    }

    const parentNode = this.getNodeAtPath(destParent);
    if (parentNode?.type === 'dir' && parentNode.children) {
      parentNode.children[destName] = cloned;
    }
  }

  mv(src: string, dest: string): void {
    const srcPath = this.resolvePath(src);
    if (!this.exists(srcPath)) {
      throw new Error(`mv: cannot stat '${src}': No such file or directory`);
    }

    const srcNode = this.getNodeAtPath(srcPath);
    if (!srcNode) return;

    const destPath = this.resolvePath(dest);
    const cloned = cloneDeep(srcNode);

    if (this.exists(destPath) && this.isDirectory(destPath)) {
      const srcName = srcPath.split('/').pop()!;
      const destNode = this.getNodeAtPath(destPath);
      if (destNode?.type === 'dir' && destNode.children) {
        destNode.children[srcName] = cloned;
      }
    } else {
      const destParts = destPath.split('/').filter(p => p !== '');
      const destName = destParts.pop()!;
      const destParent = '/' + destParts.join('/');

      if (!this.exists(destParent) || !this.isDirectory(destParent)) {
        throw new Error(`mv: cannot move '${src}' to '${dest}': No such file or directory`);
      }

      const parentNode = this.getNodeAtPath(destParent);
      if (parentNode?.type === 'dir' && parentNode.children) {
        parentNode.children[destName] = cloned;
      }
    }

    const srcParts = srcPath.split('/').filter(p => p !== '');
    const srcName = srcParts.pop()!;
    const srcParent = '/' + srcParts.join('/');
    const srcParentNode = this.getNodeAtPath(srcParent);
    if (srcParentNode?.type === 'dir' && srcParentNode.children) {
      delete srcParentNode.children[srcName];
    }
  }

  readLines(path: string): string[] {
    const content = this.cat(path);
    if (content === '') return [];
    return content.split('\n');
  }

  chmod(path: string, mode: string): void {
    const absolutePath = this.resolvePath(path);
    const node = this.getNodeAtPath(absolutePath);
    if (!node) {
      throw new Error(`chmod: cannot access '${path}': No such file or directory`);
    }
    node.permissions = this.octalToSymbolic(mode);
  }

  chown(path: string, owner: string, group?: string): void {
    const absolutePath = this.resolvePath(path);
    const node = this.getNodeAtPath(absolutePath);
    if (!node) {
      throw new Error(`chown: cannot access '${path}': No such file or directory`);
    }
    node.owner = owner;
    if (group) {
      node.group = group;
    }
  }

  findNodes(startPath: string, options: { name?: string; type?: 'f' | 'd' }): string[] {
    const absoluteStart = this.resolvePath(startPath);
    const results: string[] = [];
    this.walkTree(absoluteStart, absoluteStart, options, results);
    return results;
  }

  private walkTree(
    basePath: string,
    currentPath: string,
    options: { name?: string; type?: 'f' | 'd' },
    results: string[]
  ): void {
    const node = this.getNodeAtPath(currentPath);
    if (!node) return;

    const name = currentPath.split('/').pop() || '';
    const relativePath = currentPath === basePath
      ? '.'
      : './' + currentPath.slice(basePath.length + 1);

    const matchesName = !options.name || this.globMatch(name, options.name);
    const matchesType = !options.type ||
      (options.type === 'f' && node.type === 'file') ||
      (options.type === 'd' && node.type === 'dir');

    if (matchesName && matchesType && currentPath !== basePath) {
      results.push(relativePath);
    }

    if (node.type === 'dir' && node.children) {
      for (const childName of Object.keys(node.children).sort()) {
        const childPath = currentPath === '/' ? `/${childName}` : `${currentPath}/${childName}`;
        this.walkTree(basePath, childPath, options, results);
      }
    }
  }

  private globMatch(name: string, pattern: string): boolean {
    const regex = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regex}$`).test(name);
  }

  private octalToSymbolic(octal: string): string {
    const digitToPerms = (d: number): string => {
      let s = '';
      s += (d & 4) ? 'r' : '-';
      s += (d & 2) ? 'w' : '-';
      s += (d & 1) ? 'x' : '-';
      return s;
    };

    const digits = octal.split('').map(Number);
    if (digits.length === 3) {
      return digits.map(digitToPerms).join('');
    }
    return octal;
  }

  clone(): VirtualFilesystem {
    return new VirtualFilesystem(this.tree, this.cwd);
  }
}

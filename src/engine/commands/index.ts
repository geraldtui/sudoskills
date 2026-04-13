import { VirtualFilesystem } from '../filesystem';
import { ExecutionResult, ParsedCommand } from '@/types';
import { pwd } from './pwd';
import { ls } from './ls';
import { cd } from './cd';
import { mkdir } from './mkdir';
import { touch } from './touch';
import { cat } from './cat';
import { echo } from './echo';
import { rm } from './rm';
import { clear } from './clear';
import { man } from './man';
import { cp } from './cp';
import { mv } from './mv';
import { head } from './head';
import { tail } from './tail';
import { wc } from './wc';
import { grep } from './grep';
import { find } from './find';
import { which } from './which';
import { chmod } from './chmod';
import { chown } from './chown';
import { sort } from './sort';
import { uniq } from './uniq';
import { cut } from './cut';
import { tee } from './tee';
import { ps } from './ps';
import { kill } from './kill';
import { whoami } from './whoami';
import { id } from './id';
import { sudo } from './sudo';

export type CommandHandler = (
  parsed: ParsedCommand,
  fs: VirtualFilesystem
) => ExecutionResult;

export const commandRegistry: Record<string, CommandHandler> = {
  pwd,
  ls,
  cd,
  mkdir,
  touch,
  cat,
  echo,
  rm,
  clear,
  man,
  cp,
  mv,
  head,
  tail,
  wc,
  grep,
  find,
  which: which as CommandHandler,
  chmod,
  chown,
  sort,
  uniq,
  cut,
  tee,
  ps: ps as CommandHandler,
  kill: kill as CommandHandler,
  whoami: whoami as CommandHandler,
  id: id as CommandHandler,
  sudo,
};

export {
  pwd, ls, cd, mkdir, touch, cat, echo, rm, clear, man,
  cp, mv, head, tail, wc, grep, find, which, chmod, chown,
  sort, uniq, cut, tee, ps, kill, whoami, id, sudo,
};

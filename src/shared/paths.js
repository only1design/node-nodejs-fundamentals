import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const srcPath = path.dirname(__dirname);
export const projectRootPath = path.dirname(srcPath);
export const workspacePath = path.join(projectRootPath, 'workspace');
export const workspaceRestoredPath = path.join(projectRootPath, 'workspace_restored');
export const snapshotPath = path.join(workspacePath, 'snapshot.json');
export const partsPath = path.join(workspacePath, 'parts');
export const mergedFilePath = path.join(workspacePath, 'merged.txt');
export const pluginsPath = path.join(srcPath, 'modules', 'plugins');
export const checksumsPath = path.join(workspacePath, 'checksums.json');
export const sourcePath = path.join(workspacePath, 'source.txt');
export const toCompressPath = path.join(workspacePath, 'toCompress');
export const archivePath = path.join(workspacePath, 'compressed', 'archive.br');
export const decompressedPath = path.join(workspacePath, 'decompressed');
export const dataPath = path.join(workspacePath, 'data.json');
export const workerPath = path.join(srcPath, 'wt', 'worker.js');

import { AXPFileStorageService } from '@acorex-platform/framework-client/common';
import { AXPFileListItem } from '@acorex-platform/framework-shared/core';

//#region ---- Download helpers ----

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resolveFileForDownload(file: AXPFileListItem): AXPFileListItem {
  if (file.source) {
    return file;
  }
  if (typeof file.id === 'string' && file.id.trim()) {
    return { ...file, source: { kind: 'fileId', value: file.id } };
  }
  return file;
}

export async function downloadFileListItem(
  file: AXPFileListItem,
  fileStorageService: AXPFileStorageService,
): Promise<void> {
  const resolved = resolveFileForDownload(file);
  const source = resolved.source;
  if (!source) {
    return;
  }

  switch (source.kind) {
    case 'blob':
      if (source.value instanceof Blob) {
        triggerBlobDownload(source.value, resolved.name ?? 'download');
      }
      break;
    case 'fileId':
      if (typeof source.value === 'string') {
        const fileInfo = await fileStorageService.getInfo(source.value);
        if (fileInfo?.url) {
          const link = document.createElement('a');
          link.href = fileInfo.url;
          link.download = resolved.name ?? fileInfo.name ?? 'download';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
        if (fileInfo && (fileInfo as { binary?: Blob }).binary instanceof Blob) {
          triggerBlobDownload(
            (fileInfo as { binary: Blob }).binary,
            resolved.name ?? fileInfo.name ?? 'download',
          );
        }
      }
      break;
    case 'url':
      if (typeof source.value === 'string') {
        const link = document.createElement('a');
        link.href = source.value;
        link.download = resolved.name ?? 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      break;
    default:
      break;
  }
}

export function canDownloadFileListItem(file: AXPFileListItem): boolean {
  const resolved = resolveFileForDownload(file);
  const source = resolved.source;
  if (!source) {
    return false;
  }
  if (source.kind === 'blob') {
    return source.value instanceof Blob;
  }
  if (source.kind === 'fileId') {
    return typeof source.value === 'string' && source.value.trim().length > 0;
  }
  if (source.kind === 'url') {
    return typeof source.value === 'string' && source.value.trim().length > 0;
  }
  return false;
}

//#endregion

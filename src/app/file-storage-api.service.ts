import {
  AXPFileManyStorageInfo,
  AXPFileStorageCreateRequest,
  AXPFileStorageFindRequest,
  AXPFileStorageInfo,
  AXPFileStorageUpdateRequest,
  AXPRequestError,
  AXP_PLATFORM_ERROR_CODES,
  runtimeQueryCollectionData,
  runtimeQueryPayloadData,
  runtimeCommandPayloadData,
} from '@acorex-platform/framework-shared/core';
import {
  AXPFileStorageService,
  AXP_ROOT_CONFIG_TOKEN,
  buildFileStorageDownloadUrl,
  toAXPRequestError,
} from '@acorex-platform/framework-client/common';
import { AXPCommandService, AXPQueryService } from '@acorex-platform/framework-client/runtime';
import {
  FILE_COMMIT_DEFAULT,
  FILE_FIND_DEFAULT,
  FILE_FIND_MANY_DEFAULT,
  FILE_GET_INFO_DEFAULT,
  FILE_MARK_FOR_DELETION_DEFAULT,
  FILE_REMOVE_DEFAULT,
  FILE_SAVE_DEFAULT,
  FILE_UPDATE_DEFAULT,
} from '@acorex-platform/framework-shared/runtime';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapHttpErrorResponseToAXPRequestError } from '@acorex-platform/client-connectivity-api';

//#region ----- Helpers -----

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function toFileObject(binary: Blob, info: Pick<AXPFileStorageInfo, 'name' | 'mimeType'>): File {
  const fileName = info.name ?? 'download';
  const mimeType = info.mimeType || binary.type || 'application/octet-stream';
  return new File([binary], fileName, { type: mimeType });
}

//#endregion

//#region ----- File storage API -----

@Injectable()
export class AXCFileStorageApiService extends AXPFileStorageService {
  private readonly commandService = inject(AXPCommandService);
  private readonly queryService = inject(AXPQueryService);
  private readonly http = inject(HttpClient);
  private readonly configs = inject(AXP_ROOT_CONFIG_TOKEN);

  getDownloadUrl(fileId: string): string {
    return buildFileStorageDownloadUrl(this.configs.baseUrl, fileId);
  }

  async download(fileId: string): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http
          .get(this.getDownloadUrl(fileId), {
            responseType: 'blob',
            withCredentials: true,
          })
          .pipe(catchError((error) => throwError(() => mapHttpErrorResponseToAXPRequestError(error)))),
      );
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async save(request: AXPFileStorageCreateRequest): Promise<AXPFileStorageInfo> {
    try {
      const fileBase64 = await fileToBase64(request.file);
      const result = await this.commandService.execute(FILE_SAVE_DEFAULT, {
        fileBase64,
        fileName: request.file.name,
        mimeType: request.file.type || 'application/octet-stream',
        refId: request.refId,
        refType: request.refType,
        category: request.category,
        name: request.name,
        path: request.path,
        isPrimary: request.isPrimary,
        status: request.status,
        metadata: request.metadata,
      });
      const data = runtimeCommandPayloadData(result);
      if (!data) {
        throw AXPRequestError.fromCommandResult(result);
      }
      const info = data as AXPFileStorageInfo;
      return {
        ...info,
        uploadedAt: new Date(info.uploadedAt),
      };
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async update(request: AXPFileStorageUpdateRequest): Promise<AXPFileStorageInfo> {
    try {
      const result = await this.commandService.execute(FILE_UPDATE_DEFAULT, request);
      const data = runtimeCommandPayloadData(result);
      if (!data) {
        throw AXPRequestError.fromCommandResult(result);
      }
      const info = data as AXPFileStorageInfo;
      return {
        ...info,
        uploadedAt: new Date(info.uploadedAt),
      };
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async find(request: AXPFileStorageFindRequest): Promise<AXPFileStorageInfo[]> {
    const result = await this.queryService.fetch<AXPFileStorageFindRequest, AXPFileStorageInfo>(
      FILE_FIND_DEFAULT,
      request,
    );
    const page = runtimeQueryCollectionData(result);
    return (page?.items ?? []).map((info) => ({
      ...info,
      uploadedAt: new Date(info.uploadedAt),
    }));
  }

  async getInfo(fileId: string): Promise<AXPFileStorageInfo> {
    try {
      const result = await this.queryService.fetch<{ fileId: string }, AXPFileStorageInfo>(
        FILE_GET_INFO_DEFAULT,
        { fileId },
      );
      const info = runtimeQueryPayloadData(result);
      if (!info) {
        throw new AXPRequestError('File not found', { code: AXP_PLATFORM_ERROR_CODES.NOT_FOUND });
      }
      const binary = await this.download(fileId);
      return {
        ...info,
        uploadedAt: new Date(info.uploadedAt),
        url: this.getDownloadUrl(fileId),
        binary: toFileObject(binary, info) as unknown as File,
      };
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async findMany(ids: string[]): Promise<AXPFileManyStorageInfo[]> {
    const result = await this.queryService.fetch<{ ids: string[] }, AXPFileManyStorageInfo>(
      FILE_FIND_MANY_DEFAULT,
      { ids },
    );
    return runtimeQueryCollectionData(result)?.items ?? [];
  }

  async remove(fileId: string): Promise<void> {
    try {
      const result = await this.commandService.execute(FILE_REMOVE_DEFAULT, { fileId });
      if (!result?.success) {
        throw AXPRequestError.fromCommandResult(result);
      }
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async commit(fileId: string): Promise<void> {
    try {
      const result = await this.commandService.execute(FILE_COMMIT_DEFAULT, { fileId });
      if (!result?.success) {
        throw AXPRequestError.fromCommandResult(result);
      }
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }

  async markForDeletion(fileId: string): Promise<void> {
    try {
      const result = await this.commandService.execute(FILE_MARK_FOR_DELETION_DEFAULT, { fileId });
      if (!result?.success) {
        throw AXPRequestError.fromCommandResult(result);
      }
    } catch (error) {
      throw toAXPRequestError(error);
    }
  }
}

//#endregion

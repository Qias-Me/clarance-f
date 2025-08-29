/**
 * API Versioning System
 * 
 * Provides version management and routing for API endpoints
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { AppError } from "../../app/utils/error-handler";

export const API_VERSIONS = {
  v1: '1.0.0',
  v2: '2.0.0',
  latest: 'v2'
} as const;

export type ApiVersion = keyof typeof API_VERSIONS;

export interface VersionedRoute {
  version: ApiVersion;
  handler: (args: LoaderFunctionArgs | ActionFunctionArgs) => Promise<Response>;
  deprecated?: boolean;
  deprecationDate?: string;
  migrationGuide?: string;
}

/**
 * Extract API version from request URL
 */
export function extractApiVersion(request: Request): ApiVersion {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  
  // Look for version in path: /api/v1/... or /api/v2/...
  const versionIndex = pathSegments.findIndex(segment => segment === 'api') + 1;
  const versionSegment = pathSegments[versionIndex];
  
  if (versionSegment && versionSegment in API_VERSIONS) {
    return versionSegment as ApiVersion;
  }
  
  // Check for version header
  const versionHeader = request.headers.get('API-Version');
  if (versionHeader && versionHeader in API_VERSIONS) {
    return versionHeader as ApiVersion;
  }
  
  // Default to latest
  return API_VERSIONS.latest as ApiVersion;
}

/**
 * Version-aware route handler
 */
export function createVersionedHandler(
  routes: Map<ApiVersion, VersionedRoute>
): (args: LoaderFunctionArgs | ActionFunctionArgs) => Promise<Response> {
  return async (args) => {
    const version = extractApiVersion(args.request);
    const route = routes.get(version);
    
    if (!route) {
      throw new AppError(
        `API version ${version} not supported`,
        'VERSION_NOT_SUPPORTED',
        400
      );
    }
    
    // Add deprecation warning if applicable
    const response = await route.handler(args);
    
    if (route.deprecated) {
      response.headers.set('X-API-Deprecated', 'true');
      response.headers.set('X-API-Deprecation-Date', route.deprecationDate || 'unknown');
      if (route.migrationGuide) {
        response.headers.set('X-API-Migration-Guide', route.migrationGuide);
      }
    }
    
    response.headers.set('X-API-Version', version);
    return response;
  };
}

/**
 * Version compatibility checker
 */
export function checkVersionCompatibility(
  requestedVersion: ApiVersion,
  minimumVersion: ApiVersion
): boolean {
  const versions = Object.keys(API_VERSIONS) as ApiVersion[];
  const requestedIndex = versions.indexOf(requestedVersion);
  const minimumIndex = versions.indexOf(minimumVersion);
  
  return requestedIndex >= minimumIndex;
}

/**
 * Version migration helper
 */
export class VersionMigrator {
  private migrations = new Map<string, (data: unknown) => unknown>();
  
  register(fromVersion: ApiVersion, toVersion: ApiVersion, migrator: (data: unknown) => unknown): void {
    const key = `${fromVersion}->${toVersion}`;
    this.migrations.set(key, migrator);
  }
  
  migrate(data: unknown, fromVersion: ApiVersion, toVersion: ApiVersion): unknown {
    const key = `${fromVersion}->${toVersion}`;
    const migrator = this.migrations.get(key);
    
    if (!migrator) {
      throw new AppError(
        `No migration path from ${fromVersion} to ${toVersion}`,
        'MIGRATION_NOT_FOUND',
        500
      );
    }
    
    return migrator(data);
  }
  
  canMigrate(fromVersion: ApiVersion, toVersion: ApiVersion): boolean {
    const key = `${fromVersion}->${toVersion}`;
    return this.migrations.has(key);
  }
}

export const versionMigrator = new VersionMigrator();
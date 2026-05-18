import { Prisma, SystemSetting } from '@prisma/client';

export interface ModelConfigSetting {
  imageProvider: string;
  model: string;
  publicAssetBaseUrl: string;
}

export interface QuotaPolicySetting {
  freeDaily: number;
  creatorDaily: number;
  businessDaily: number;
}

export interface FeatureFlagSetting {
  community: boolean;
  payments: boolean;
  mockGeneration: boolean;
}

export interface AdminSettingsView {
  imageProvider: string;
  model: string;
  publicAssetBaseUrl: string;
  quotaPolicy: QuotaPolicySetting;
  featureFlags: FeatureFlagSetting;
}

const defaultModelConfig: ModelConfigSetting = {
  imageProvider: 'figure-script',
  model: 'gpt-image-1',
  publicAssetBaseUrl: 'http://127.0.0.1:3000/static'
};

const defaultQuotaPolicy: QuotaPolicySetting = {
  freeDaily: 5,
  creatorDaily: 100,
  businessDaily: -1
};

const defaultFeatureFlags: FeatureFlagSetting = {
  community: true,
  payments: false,
  mockGeneration: false
};

export function normalizeSettings(rows: SystemSetting[]): AdminSettingsView {
  const rowMap = new Map(rows.map(row => [row.key, row.value]));
  const modelConfig = parseJson<ModelConfigSetting>(rowMap.get('modelConfig'), defaultModelConfig);
  const quotaPolicy = parseJson<QuotaPolicySetting>(rowMap.get('quotaPolicy'), defaultQuotaPolicy);
  const featureFlags = parseJson<FeatureFlagSetting>(rowMap.get('featureFlags'), defaultFeatureFlags);

  return {
    imageProvider: modelConfig.imageProvider,
    model: modelConfig.model,
    publicAssetBaseUrl: modelConfig.publicAssetBaseUrl,
    quotaPolicy,
    featureFlags
  };
}

export function settingsToRows(settings: AdminSettingsView) {
  return [
    {
      key: 'modelConfig',
      value: {
        imageProvider: settings.imageProvider,
        model: settings.model,
        publicAssetBaseUrl: settings.publicAssetBaseUrl
      } as Prisma.InputJsonValue
    },
    {
      key: 'quotaPolicy',
      value: settings.quotaPolicy as unknown as Prisma.InputJsonValue
    },
    {
      key: 'featureFlags',
      value: settings.featureFlags as unknown as Prisma.InputJsonValue
    }
  ];
}

function parseJson<T>(value: Prisma.JsonValue | undefined, fallback: T): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback;
  }

  return { ...fallback, ...value } as T;
}

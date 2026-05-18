const defaultModelConfig = {
    imageProvider: 'figure-script',
    model: 'gpt-image-1',
    publicAssetBaseUrl: 'http://127.0.0.1:3000/static'
};
const defaultQuotaPolicy = {
    freeDaily: 5,
    creatorDaily: 100,
    businessDaily: -1
};
const defaultFeatureFlags = {
    community: true,
    payments: false,
    mockGeneration: false
};
export function normalizeSettings(rows) {
    const rowMap = new Map(rows.map(row => [row.key, row.value]));
    const modelConfig = parseJson(rowMap.get('modelConfig'), defaultModelConfig);
    const quotaPolicy = parseJson(rowMap.get('quotaPolicy'), defaultQuotaPolicy);
    const featureFlags = parseJson(rowMap.get('featureFlags'), defaultFeatureFlags);
    return {
        imageProvider: modelConfig.imageProvider,
        model: modelConfig.model,
        publicAssetBaseUrl: modelConfig.publicAssetBaseUrl,
        quotaPolicy,
        featureFlags
    };
}
export function settingsToRows(settings) {
    return [
        {
            key: 'modelConfig',
            value: {
                imageProvider: settings.imageProvider,
                model: settings.model,
                publicAssetBaseUrl: settings.publicAssetBaseUrl
            }
        },
        {
            key: 'quotaPolicy',
            value: settings.quotaPolicy
        },
        {
            key: 'featureFlags',
            value: settings.featureFlags
        }
    ];
}
function parseJson(value, fallback) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return fallback;
    }
    return { ...fallback, ...value };
}

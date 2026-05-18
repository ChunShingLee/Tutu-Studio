import 'dotenv/config';
export const config = {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
    imageProvider: process.env.IMAGE_PROVIDER ?? 'figure-script',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    openaiImageModel: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
    publicAssetBaseUrl: process.env.PUBLIC_ASSET_BASE_URL ?? 'http://127.0.0.1:3000/static',
    figureImageScriptPath: process.env.FIGURE_IMAGE_SCRIPT_PATH ?? '~/.hermes/skills/openclaw-imports/figure-gpt-image-2/scripts/generate.py',
    adminCookieSecret: process.env.ADMIN_COOKIE_SECRET
        ?? process.env.JWT_SECRET
        ?? 'change-me-before-production-change-me',
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@tutu.local',
    adminPassword: process.env.ADMIN_PASSWORD ?? 'TutuAdmin123!',
    adminOperatorEmail: process.env.ADMIN_OPERATOR_EMAIL ?? 'operator@tutu.local',
    adminOperatorPassword: process.env.ADMIN_OPERATOR_PASSWORD ?? 'TutuOperator123!'
};

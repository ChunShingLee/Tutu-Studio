#!/bin/bash
# 模板广场卡片图片生成脚本
# 使用 GPT Image 2 API 生成模板广场各卡片的展示图
#
# 用法: chmod +x generate_plaza_images.sh && ./generate_plaza_images.sh

API_URL="https://figure.jiangsuocean.cn/v1/images/generations"
API_KEY="sk-h2MeijehsL8pwpioaMy21gFk6Kvjg2LtGQSVt71wuCruVGOM"
MODEL="gpt-image-2"
OUTPUT_DIR="ios/TuTuVisionApp/TuTuVisionApp/Resources/Generated/Templates"

mkdir -p "$OUTPUT_DIR"

generate_image() {
    local filename="$1"
    local prompt="$2"
    local size="$3"

    echo "⏳ Generating: $filename ($size)..."

    response=$(curl -s "$API_URL" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"model\": \"$MODEL\",
        \"prompt\": \"$prompt\",
        \"size\": \"$size\",
        \"n\": 1
      }")

    echo "$response" | python3 -c "
import sys, json, base64
data = json.load(sys.stdin)
if 'data' in data and len(data['data']) > 0:
    img = base64.b64decode(data['data'][0]['b64_json'])
    with open('$OUTPUT_DIR/$filename', 'wb') as f:
        f.write(img)
    print('  ✅ Saved $filename (' + str(len(img)) + ' bytes)')
else:
    print('  ❌ Failed: ' + json.dumps(data))
"
}

echo "🎨 开始生成模板广场卡片图片..."
echo ""

# Hero 卡 — 固定模板库总览图 (横版)
generate_image "plaza-hero-overview.png" \
  "A premium creative design workspace overview: multiple beautiful design template cards floating elegantly in 3D space, including a fashion portrait, luxury product shot, food photography, and brand poster. Soft warm gradient background in pink and lavender tones. Modern glassmorphism aesthetic with frosted glass card effects. Professional, clean, minimal. No text or words." \
  "1536x1024"

echo ""

# 4 个数据卡片 (方形)
generate_image "plaza-stat-all.png" \
  "A colorful mosaic grid of diverse creative design templates: product photos, portraits, posters, illustrations, food photography. Bird's eye view, tightly arranged, vibrant colors. Professional design portfolio overview. No text." \
  "1024x1024"

generate_image "plaza-stat-premium.png" \
  "A luxurious golden crown floating above premium design templates with sparkles and golden light rays. Rich purple and gold color scheme. VIP membership concept, exclusive and elegant. No text." \
  "1024x1024"

generate_image "plaza-stat-categories.png" \
  "Abstract colorful tags and labels floating in space, representing different industry categories: fashion, food, tech, beauty, lifestyle. Soft pastel colors, organized grid layout, modern flat design. No text." \
  "1024x1024"

generate_image "plaza-stat-collections.png" \
  "Stacked curated design collections shown as layered cards with different themes: e-commerce, social media, branding. 3D perspective, soft shadows, warm orange and purple gradient background. No text." \
  "1024x1024"

echo ""

# 4 个推荐专题卡片 (横版)
generate_image "plaza-collection-ecommerce.png" \
  "E-commerce product photography collection: a hero product shot of a luxury skincare bottle with soft studio lighting, clean white background, professional commercial photography style. Warm golden highlights, premium feel. No text." \
  "1536x1024"

generate_image "plaza-collection-social.png" \
  "Social media content creation: a trendy lifestyle flat-lay with coffee, notebook, flowers, and a phone showing a beautiful Instagram-style grid. Soft pink and coral tones, influencer aesthetic, modern and fresh. No text." \
  "1536x1024"

generate_image "plaza-collection-branding.png" \
  "Brand identity design showcase: elegant business cards, letterhead, and packaging mockups arranged on a marble surface. Minimalist luxury branding with gold foil accents. Earth tones and sophisticated palette. No text." \
  "1536x1024"

generate_image "plaza-collection-portrait.png" \
  "Professional portrait photography: a confident woman in soft natural light, shallow depth of field, warm skin tones, editorial fashion style. Clean background with subtle bokeh. Cinematic color grading. No text." \
  "1536x1024"

echo ""
echo "🎉 全部生成完成！图片保存在: $OUTPUT_DIR/"

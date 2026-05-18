//
//  FlowingBorder.metal
//  兔兔 Liquid Glass — Hero 卡液态噪声边 Shader
//
//  用法:在 SwiftUI 里 `.colorEffect(ShaderLibrary.default.liquidNoiseBorder(.float(time), .float(period)))`
//
//  思路:
//    - half4 currentColor(float2 position, half4 color) 是 colorEffect 的标准签名。
//    - 我们在 AngularGradient 的像素上,用 2D 正弦噪声做轻微色相偏移与亮度扰动,
//      产生"液态噪声"的折射感。
//    - 再按时间向上流动,让同一条光边看起来是在"流淌"。
//
//  Performance notes:
//    - 全部计算在片元着色器里,时间复杂度 O(1)/pixel。
//    - 单屏 10 张 Hero 卡同屏,每张 ~56x200pt,总像素约 112k,iPhone 14 GPU 轻松 60fps。

#include <metal_stdlib>
using namespace metal;

// 稳定的 hash 噪声,避免 mod 在 half 精度下抖动。
static inline float hash21(float2 p) {
    p = fract(p * float2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// 双层 sin 噪声,开销比 Perlin 便宜很多,视觉足够"液态"。
static inline float liquidNoise(float2 uv, float t) {
    float n1 = sin(uv.x * 3.1 + t * 1.6) * sin(uv.y * 2.7 - t * 1.2);
    float n2 = sin(uv.x * 6.3 - t * 0.9 + uv.y * 4.4);
    float h  = hash21(uv + t * 0.08);
    return n1 * 0.45 + n2 * 0.30 + (h - 0.5) * 0.12;
}

// colorEffect 签名:
//   half4 shaderName(float2 position, half4 currentColor, <params...>)
// position 是像素坐标(pt → px),currentColor 是已经由 SwiftUI 渲染出的颜色。
[[ stitchable ]]
half4 liquidNoiseBorder(float2 position, half4 color, float time, float period) {
    // 只处理有颜色的像素(描边外是 alpha=0,跳过以保持透明)
    if (color.a < 0.02h) {
        return color;
    }

    // 把时间归一化成 0~1 的相位(period 秒一圈)
    float phase = fract(time / max(period, 0.01));

    // 像素坐标归一到 "大致 0~1" 的区间,适配不同卡尺寸
    float2 uv = position * 0.008;

    float n = liquidNoise(uv + float2(0.0, -phase * 2.0), time * 0.6);

    // 轻微调亮/调暗 + 提高饱和
    half lift = half(0.15 + 0.22 * n);

    half3 rgb = color.rgb;
    // 色相在 RGB 通道做小幅 "旋转" 来模拟折射
    half3 shifted = half3(
        rgb.r + half(0.08 * n),
        rgb.g + half(0.04 * n * 0.6),
        rgb.b - half(0.06 * n)
    );

    shifted = clamp(shifted + lift, 0.0h, 1.6h); // 允许 >1 做 plusLighter 发光

    return half4(shifted, color.a);
}

const DEFAULT_BUDGETS = {
  low: 900,
  medium: 2600,
  high: 6500,
};

const STYLE_POSTER_PALETTES = {
  modern: { accent: '#5f7483', accentSoft: 'rgba(95, 116, 131, 0.2)', panel: 'rgba(20, 28, 33, 0.78)' },
  traditional: { accent: '#8c6a57', accentSoft: 'rgba(140, 106, 87, 0.22)', panel: 'rgba(38, 28, 24, 0.8)' },
  scandinavian: { accent: '#9aa69e', accentSoft: 'rgba(154, 166, 158, 0.22)', panel: 'rgba(35, 42, 39, 0.78)' },
  industrial: { accent: '#8b7661', accentSoft: 'rgba(139, 118, 97, 0.22)', panel: 'rgba(28, 31, 34, 0.82)' },
  bohemian: { accent: '#b3835a', accentSoft: 'rgba(179, 131, 90, 0.24)', panel: 'rgba(51, 36, 28, 0.8)' },
  midcentury: { accent: '#a58b67', accentSoft: 'rgba(165, 139, 103, 0.24)', panel: 'rgba(43, 34, 25, 0.8)' },
  mediterranean: { accent: '#c69463', accentSoft: 'rgba(198, 148, 99, 0.24)', panel: 'rgba(48, 36, 27, 0.8)' },
  japanese: { accent: '#93846a', accentSoft: 'rgba(147, 132, 106, 0.22)', panel: 'rgba(31, 29, 25, 0.82)' },
  minimalist: { accent: '#8e989d', accentSoft: 'rgba(142, 152, 157, 0.2)', panel: 'rgba(23, 27, 29, 0.82)' },
  farmhouse: { accent: '#9f8f7d', accentSoft: 'rgba(159, 143, 125, 0.24)', panel: 'rgba(39, 33, 28, 0.8)' },
  default: { accent: '#a58b67', accentSoft: 'rgba(165, 139, 103, 0.22)', panel: 'rgba(28, 32, 35, 0.8)' },
};

const getBudgetAmount = (tier = 'medium') => DEFAULT_BUDGETS[tier] || DEFAULT_BUDGETS.medium;

const getPosterPalette = (styleKey = '') => STYLE_POSTER_PALETTES[styleKey] || STYLE_POSTER_PALETTES.default;

const supportsCanvas = () => {
  const canvas = document.createElement('canvas');
  return typeof canvas.getContext === 'function';
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  if (!String(src || '').startsWith('data:')) {
    image.crossOrigin = 'anonymous';
  }
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const drawCoverImage = (ctx, image, width, height) => {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
  }

  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
};

const inferDetectedTags = (profile = null) => {
  if (!profile) return [];

  const inferred = new Set();
  if (profile.average_brightness >= 0.62) {
    inferred.add('neutral');
    inferred.add('white');
    inferred.add('light-wood');
  }
  if (profile.average_brightness <= 0.35) {
    inferred.add('rich-colors');
    inferred.add('walnut');
  }
  if (profile.average_saturation >= 0.56) {
    inferred.add('colorful');
    inferred.add('patterns');
  }
  if (profile.average_saturation <= 0.24) {
    inferred.add('monochrome');
    inferred.add('clean');
    inferred.add('simple');
  }
  if (profile.warmth_bias >= 0.1) {
    inferred.add('cozy');
    inferred.add('natural');
  }
  if (profile.warmth_bias <= -0.1) {
    inferred.add('sleek');
    inferred.add('geometric');
    inferred.add('contemporary');
  }

  return Array.from(inferred);
};

const extractImageProfile = async (sourceUrl) => {
  if (!sourceUrl) return null;

  try {
    const image = await loadImage(sourceUrl);
    const width = image.naturalWidth || image.width || 0;
    const height = image.naturalHeight || image.height || 0;
    const profile = {
      width,
      height,
      aspect_ratio: width && height ? Number((width / height).toFixed(3)) : 1,
      average_brightness: 0.5,
      average_saturation: 0.4,
      warmth_bias: 0,
      dominant_hex: '#b0a79b',
    };

    if (!supportsCanvas()) return profile;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 32;
    sampleCanvas.height = 32;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return profile;

    ctx.drawImage(image, 0, 0, sampleCanvas.width, sampleCanvas.height);
    const { data } = ctx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
    let totalBrightness = 0;
    let totalSaturation = 0;
    let totalWarmth = 0;
    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;
    let count = 0;

    for (let index = 0; index < data.length; index += 4) {
      const alpha = data[index + 3] / 255;
      if (alpha <= 0) continue;
      const red = data[index] / 255;
      const green = data[index + 1] / 255;
      const blue = data[index + 2] / 255;
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const brightness = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

      totalBrightness += brightness;
      totalSaturation += saturation;
      totalWarmth += red - blue;
      totalRed += red;
      totalGreen += green;
      totalBlue += blue;
      count += 1;
    }

    if (count === 0) return profile;

    const averageRed = Math.round((totalRed / count) * 255);
    const averageGreen = Math.round((totalGreen / count) * 255);
    const averageBlue = Math.round((totalBlue / count) * 255);

    return {
      ...profile,
      average_brightness: Number((totalBrightness / count).toFixed(3)),
      average_saturation: Number((totalSaturation / count).toFixed(3)),
      warmth_bias: Number((totalWarmth / count).toFixed(3)),
      dominant_hex: `#${[averageRed, averageGreen, averageBlue].map((value) => value.toString(16).padStart(2, '0')).join('')}`,
    };
  } catch {
    return null;
  }
};

const renderRoundedPanel = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const renderWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }
    if (currentLine) lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
};

const renderConceptPreview = async ({ sourceUrl, analysis, styleInfo }) => {
  if (!sourceUrl || !analysis) return sourceUrl;

  try {
    let image = null;
    try {
      image = await loadImage(sourceUrl);
    } catch {
      image = null;
    }
    if (!supportsCanvas()) return sourceUrl;

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return sourceUrl;

    const palette = getPosterPalette(styleInfo?.key);
    if (image) {
      drawCoverImage(ctx, image, canvas.width, canvas.height);
    } else {
      const fallbackGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      fallbackGradient.addColorStop(0, '#eae4da');
      fallbackGradient.addColorStop(1, '#bca68b');
      ctx.fillStyle = fallbackGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const sceneGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    sceneGradient.addColorStop(0, 'rgba(10, 12, 15, 0.08)');
    sceneGradient.addColorStop(0.55, palette.accentSoft);
    sceneGradient.addColorStop(1, 'rgba(7, 9, 11, 0.28)');
    ctx.fillStyle = sceneGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, 0, canvas.width, 96);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.font = '600 20px Georgia, serif';
    ctx.fillText('Design Analysis', 56, 54);

    ctx.font = '700 44px Georgia, serif';
    ctx.fillText(styleInfo?.name || 'Home4U', 56, 112);

    const selectedScore = analysis.style_scores?.find((item) => item.style_name === analysis.selected_style?.name)
      || analysis.style_scores?.[0];
    ctx.font = '600 18px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = palette.accent;
    ctx.fillText(`Match ${Math.round(selectedScore?.score_value || 0)}%`, 56, 152);

    renderRoundedPanel(ctx, 810, 52, 414, 616, 28);
    ctx.fillStyle = palette.panel;
    ctx.fill();

    ctx.fillStyle = '#f6f0e8';
    ctx.font = '600 16px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Summary', 850, 104);
    ctx.font = '700 30px Georgia, serif';
    ctx.fillText(analysis.selected_style?.name || styleInfo?.name || 'Style Direction', 850, 148);

    ctx.fillStyle = 'rgba(246, 240, 232, 0.82)';
    ctx.font = '500 18px ui-sans-serif, system-ui, sans-serif';
    renderWrappedText(ctx, analysis.summary, 850, 188, 334, 28, 3);

    ctx.fillStyle = '#f6f0e8';
    ctx.font = '600 16px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Top Signals', 850, 298);
    ctx.font = '500 17px ui-sans-serif, system-ui, sans-serif';
    (analysis.suggested_tags || []).slice(0, 4).forEach((tag, index) => {
      renderRoundedPanel(ctx, 850, 320 + index * 52, 334, 36, 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.fillStyle = '#f6f0e8';
      ctx.fillText(`${tag.name}  ${Math.round(tag.confidence * 100)}%`, 868, 344 + index * 52);
    });

    ctx.fillStyle = '#f6f0e8';
    ctx.font = '600 16px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('Priority Moves', 850, 562);
    ctx.font = '500 17px ui-sans-serif, system-ui, sans-serif';
    (analysis.recommendations || []).slice(0, 2).forEach((recommendation, index) => {
      renderWrappedText(ctx, `${index + 1}. ${recommendation.description}`, 850, 592 + index * 56, 334, 24, 2);
    });

    return canvas.toDataURL('image/png');
  } catch {
    return sourceUrl;
  }
};

export {
  DEFAULT_BUDGETS,
  extractImageProfile,
  getBudgetAmount,
  inferDetectedTags,
  renderConceptPreview,
};

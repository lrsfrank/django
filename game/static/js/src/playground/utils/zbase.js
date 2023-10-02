function getColorRGBA(color, alpha) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);

      const pixelData = ctx.getImageData(0, 0, 1, 1).data;
      const [r, g, b] = Array.from(pixelData.slice(0, 3));

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

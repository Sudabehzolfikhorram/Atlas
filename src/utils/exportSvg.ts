const SVG_NS = "http://www.w3.org/2000/svg";

function trigger(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function serialize(svg: SVGSVGElement, background: string) {
  const vb = svg.viewBox.baseVal;
  const w = vb?.width || svg.clientWidth;
  const h = vb?.height || svg.clientHeight;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.setAttribute("font-family", "Inter, 'Segoe UI', Arial, sans-serif");
  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("x", "0");
  bg.setAttribute("y", "0");
  bg.setAttribute("width", String(w));
  bg.setAttribute("height", String(h));
  bg.setAttribute("fill", background);
  clone.insertBefore(bg, clone.firstChild);
  return { markup: new XMLSerializer().serializeToString(clone), w, h };
}

/** Export an on-screen SVG chart as a standalone SVG or a 2× PNG. */
export async function downloadSvgChart(svg: SVGSVGElement, filename: string, format: "png" | "svg", background = "#0C1220") {
  const { markup, w, h } = serialize(svg, background);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  if (format === "svg") {
    trigger(URL.createObjectURL(blob), `${filename}.svg`);
    return;
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("render failed"));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("encode failed");
    trigger(URL.createObjectURL(png), `${filename}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
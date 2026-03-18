import { useEffect, useRef } from 'react'

const TWO_PI = Math.PI * 2

export default function DynamicWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width: number
    let height: number
    let imageData: ImageData
    let data: Uint8ClampedArray
    const SCALE = 3

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      width = Math.floor(canvas.width / SCALE)
      height = Math.floor(canvas.height / SCALE)
      imageData = ctx.createImageData(width, height)
      data = imageData.data
      ctx.imageSmoothingEnabled = false
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const startTime = Date.now()

    // Pre-computed trig tables for performance
    const TABLE_SIZE = 1024
    const TABLE_MASK = TABLE_SIZE - 1
    const SIN_TABLE = new Float32Array(TABLE_SIZE)
    const COS_TABLE = new Float32Array(TABLE_SIZE)
    for (let i = 0; i < TABLE_SIZE; i++) {
      const angle = (i / TABLE_SIZE) * TWO_PI
      SIN_TABLE[i] = Math.sin(angle)
      COS_TABLE[i] = Math.cos(angle)
    }

    // Fix: JS % returns negative for negative inputs → wrap correctly
    const fastSin = (x: number) => {
      const index = (Math.floor(((x % TWO_PI) + TWO_PI) / TWO_PI * TABLE_SIZE)) & TABLE_MASK
      return SIN_TABLE[index]
    }

    const fastCos = (x: number) => {
      const index = (Math.floor(((x % TWO_PI) + TWO_PI) / TWO_PI * TABLE_SIZE)) & TABLE_MASK
      return COS_TABLE[index]
    }

    // Brand colors (normalized 0–1)
    // Navy  #1a2b3d → (0.102, 0.169, 0.239)
    // Teal  #008490 → (0.000, 0.518, 0.565)
    // Steel #4b6b8b → (0.294, 0.420, 0.545)
    const BASE_R = 0.10
    const BASE_G = 0.17
    const BASE_B = 0.24

    let animId: number
    const TARGET_FPS = 30
    const FRAME_INTERVAL = 1000 / TARGET_FPS
    let lastFrameTime = 0

    const render = (now: number) => {
      animId = requestAnimationFrame(render)

      // Throttle to ~30fps — this is a background effect
      if (now - lastFrameTime < FRAME_INTERVAL) return
      lastFrameTime = now

      const time = (Date.now() - startTime) * 0.001

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / height
          const u_y = (2 * y - height) / height

          let a = 0
          let d = 0

          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x)
            d += fastSin(i * u_y + a)
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5
          const intensity = 0.35 + 0.4 * wave

          // Teal accent
          const tealAccent = 0.22 * fastSin(a * 1.5 + time * 0.2)
          // Steel accent
          const steelAccent = 0.18 * fastCos(d * 2 + time * 0.1)

          const r = Math.max(0, Math.min(1, BASE_R + steelAccent * 0.7)) * intensity
          const g = Math.max(0, Math.min(1, BASE_G + tealAccent * 1.0 + steelAccent * 0.3)) * intensity
          const b = Math.max(0, Math.min(1, BASE_B + tealAccent * 1.1 + steelAccent * 0.5)) * intensity

          const idx = (y * width + x) * 4
          data[idx] = r * 255
          data[idx + 1] = g * 255
          data[idx + 2] = b * 255
          data[idx + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)
      ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - u_res) / u_res.y;
  float a = 0.0;
  float d = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    a += cos(fi - d + u_time * 0.25 - a * uv.x);
    d += sin(fi * uv.y + a);
  }
  float wave = (sin(a) + cos(d)) * 0.5;
  float intensity = 0.50 + 0.45 * wave;
  float ta = 0.42 * sin(a * 1.5 + u_time * 0.10);
  float sa = 0.30 * cos(d * 2.0 + u_time * 0.05);
  float r = clamp(0.08 + sa * 0.7,  0.0, 1.0) * intensity;
  float g = clamp(0.22 + ta * 1.0 + sa * 0.3, 0.0, 1.0) * intensity;
  float b = clamp(0.32 + ta * 1.1 + sa * 0.5, 0.0, 1.0) * intensity;
  gl_FragColor = vec4(r, g, b, 1.0);
}
`

export default function DynamicWaveBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')

    let resizeTimer: ReturnType<typeof setTimeout>
    const resize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform2f(uRes, canvas.width, canvas.height)
      }, 100)
    }
    window.addEventListener('resize', resize)
    // Initial size without debounce
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)

    const startTime = Date.now()
    let animId: number
    let isVisible = true

    const render = () => {
      if (!isVisible) return
      animId = requestAnimationFrame(render)
      gl.uniform1f(uTime, (Date.now() - startTime) * 0.001)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) {
          animId = requestAnimationFrame(render)
        } else {
          cancelAnimationFrame(animId)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-navy" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}

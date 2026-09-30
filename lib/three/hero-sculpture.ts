import {
  ACESFilmicToneMapping,
  BackSide,
  DoubleSide,
  BoxGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Timer,
  TorusKnotGeometry,
  WebGLRenderer,
  type Texture,
} from "three"

/**
 * The hero's glass sculpture, in plain three.js (no React/Fiber).
 * Change the look here:
 *  - PALETTES: glass tint + the coloured "lightformer" panels reflected in it
 *  - SHAPE: the torus knot parameters (p/q change the knot's topology)
 *  - GLASS: physical material settings
 */
export type SculptureTheme = "dark" | "light"

export const PALETTES: Record<SculptureTheme, { tint: string; room: string; lights: string[]; exposure: number }> = {
  // Brand gradient: teal → maroon → purple (+ pink / blue accents)
  dark: { tint: "#2DD4BF", room: "#0B0F14", lights: ["#2DD4BF", "#B0304A", "#A855F7", "#F472B6"], exposure: 1.15 },
  light: { tint: "#0F766E", room: "#F0EEE9", lights: ["#0F766E", "#800000", "#7E22CE", "#1D4ED8"], exposure: 0.95 },
}

export const SHAPE = { radius: 1.02, tube: 0.2, p: 2, q: 3 }

/**
 * Glass shading. There is deliberately no physical transmission pass: the
 * canvas is transparent over the page, so there is nothing opaque behind the
 * glass to refract, and the pass would cost a second render per frame.
 * Instead the shader's alpha follows a Fresnel curve (see withGlassAlpha):
 * rims are bright and reflective, the centre is clear, and the page's living
 * gradient shows through.
 */
const GLASS = {
  metalness: 0,
  roughness: 0.06,
  ior: 1.5,
  iridescence: 1,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [180, 520] as [number, number],
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  specularIntensity: 1,
  envMapIntensity: 2.6,
  transparent: true,
}

/** Fresnel alpha: ~12% straight on, near-opaque at grazing angles and highlights. */
function withGlassAlpha(material: MeshPhysicalMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `float nrFres = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.4);
       float nrGlow = max(max(outgoingLight.r, outgoingLight.g), outgoingLight.b);
       gl_FragColor = vec4(outgoingLight, clamp(0.12 + nrFres * 0.85 + nrGlow * 0.3, 0.0, 1.0) * opacity);`
    )
  }
  return material
}

export interface SculptureOptions {
  theme: SculptureTheme
  /** Lower-poly geometry for small screens */
  lowPoly: boolean
}

export class HeroSculpture {
  readonly renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 50)
  private pmrem: PMREMGenerator
  private envTexture: Texture | null = null
  private rig = new Group()
  private knot: Mesh<TorusKnotGeometry, MeshPhysicalMaterial>
  private floaters: { mesh: Mesh; base: [number, number, number]; speed: number; phase: number }[] = []
  private timer = new Timer()
  private tilt = { x: 0, y: 0 }
  private running = false
  private elapsed = 0

  constructor(canvas: HTMLCanvasElement, opts: SculptureOptions) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" })
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5)) // dpr [1, 1.5]
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.setClearColor(0x000000, 0)
    this.pmrem = new PMREMGenerator(this.renderer)

    this.camera.position.set(0, 0, 6.5)
    this.scene.add(this.rig)

    const glass = withGlassAlpha(new MeshPhysicalMaterial({ ...GLASS, color: 0xffffff }))
    const [tubular, radial] = opts.lowPoly ? [120, 12] : [240, 28]
    this.knot = new Mesh(new TorusKnotGeometry(SHAPE.radius, SHAPE.tube, tubular, radial, SHAPE.p, SHAPE.q), glass)
    this.rig.add(this.knot)

    // Small floating glass pieces (a lightweight stand-in for drei's <Float>)
    const small = withGlassAlpha(glass.clone())
    const detail = opts.lowPoly ? 0 : 1
    const pieces: [Mesh, [number, number, number]][] = [
      [new Mesh(new IcosahedronGeometry(0.22, detail), small), [-1.75, 1.1, 0.4]],
      [new Mesh(new OctahedronGeometry(0.18, 0), small), [1.8, -1.05, 0.6]],
      [new Mesh(new IcosahedronGeometry(0.13, detail), small), [1.35, 1.45, -0.3]],
    ]
    pieces.forEach(([mesh, base], i) => {
      this.rig.add(mesh)
      mesh.position.set(...base)
      this.floaters.push({ mesh, base, speed: 0.6 + i * 0.25, phase: i * 1.7 })
    })

    this.applyTheme(opts.theme)
  }

  /**
   * Compiles shaders without blocking the main thread where the browser
   * supports KHR_parallel_shader_compile. Call before the first frame.
   */
  async ready(): Promise<void> {
    await this.renderer.compileAsync(this.scene, this.camera)
  }

  /** Recolours glass + reflections. Cheap enough to call on every theme switch. */
  setTheme(theme: SculptureTheme) {
    this.applyTheme(theme)
    if (!this.running) this.renderFrame(0)
  }

  private applyTheme(theme: SculptureTheme) {
    const palette = PALETTES[theme]
    this.envTexture?.dispose()
    const room = buildLightRoom(palette)
    this.envTexture = this.pmrem.fromScene(room, 0.02).texture
    room.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.dispose()
        ;(o.material as MeshBasicMaterial).dispose()
      }
    })
    this.scene.environment = this.envTexture
    this.renderer.toneMappingExposure = palette.exposure
    const tint = new Color(palette.tint)
    for (const mesh of [this.knot, ...this.floaters.map((f) => f.mesh)]) {
      const mat = mesh.material as MeshPhysicalMaterial
      mat.color = new Color("#FFFFFF").lerp(tint, 0.45)
    }
  }

  /** Target tilt in radians (lerped towards each frame). */
  setTilt(x: number, y: number) {
    this.tilt.x = x
    this.tilt.y = y
  }

  setSize(width: number, height: number) {
    if (width === 0 || height === 0) return
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  setRunning(running: boolean) {
    if (running === this.running) return
    this.running = running
    if (running) {
      this.timer.reset() // don't jump after a pause
      this.renderer.setAnimationLoop((time) => {
        this.timer.update(time)
        this.renderFrame(Math.min(this.timer.getDelta(), 0.05))
      })
    } else {
      this.renderer.setAnimationLoop(null)
    }
  }

  private renderFrame(dt: number) {
    this.elapsed += dt
    this.knot.rotation.y += dt * 0.16
    this.knot.rotation.z += dt * 0.05
    const k = Math.min(1, dt * 4) // lerp factor
    this.rig.rotation.x += (this.tilt.x - this.rig.rotation.x) * k
    this.rig.rotation.y += (this.tilt.y - this.rig.rotation.y) * k
    for (const f of this.floaters) {
      const t = this.elapsed * f.speed + f.phase
      f.mesh.position.set(f.base[0] + Math.sin(t * 0.7) * 0.06, f.base[1] + Math.sin(t) * 0.12, f.base[2])
      f.mesh.rotation.x += dt * 0.4
      f.mesh.rotation.y += dt * 0.3
    }
    this.renderer.render(this.scene, this.camera)
  }

  /** Renders one frame and returns it as a PNG data URL (used to make the static fallback). */
  snapshot(): string {
    // Fixed, flattering pose so the fallback image is reproducible
    this.knot.rotation.set(0.35, 0.6, 0.2)
    this.rig.rotation.set(0, 0, 0)
    this.elapsed = 0
    this.renderFrame(0)
    return this.renderer.domElement.toDataURL("image/png")
  }

  dispose() {
    this.setRunning(false)
    this.rig.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.dispose()
        ;(o.material as MeshPhysicalMaterial).dispose()
      }
    })
    this.envTexture?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}

/** A dark/light room with glowing brand-coloured panels, baked into reflections via PMREM. */
function buildLightRoom(palette: (typeof PALETTES)[SculptureTheme]): Scene {
  const room = new Scene()
  room.add(new Mesh(new BoxGeometry(14, 14, 14), new MeshBasicMaterial({ color: palette.room, side: BackSide })))
  const panel = (color: string, intensity: number, [x, y, z]: [number, number, number], [w, h]: [number, number]) => {
    const mesh = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide })
    )
    mesh.position.set(x, y, z)
    mesh.lookAt(0, 0, 0)
    room.add(mesh)
  }
  const [c1 = "#fff", c2 = "#fff", c3 = "#fff", c4 = "#fff"] = palette.lights
  panel("#ffffff", 5, [0, 6, 0], [8, 3]) // top softbox (specular highlight)
  panel(c1, 6, [-6, 1, 1], [3, 8]) // left: teal
  panel(c3, 6, [6, -1, 1], [3, 8]) // right: purple
  panel(c2, 5, [0, -1, -6], [9, 4]) // back: maroon
  panel(c4, 2.5, [2, -5, 3], [5, 2]) // floor accent: pink / blue
  // Behind the camera: what camera-facing surfaces reflect
  panel(c1, 3.5, [-4, 2, 6], [4, 3])
  panel(c3, 3.5, [4, -2, 6], [4, 3])
  panel(c2, 3, [0, 3.5, 6], [6, 1.2])
  return room
}

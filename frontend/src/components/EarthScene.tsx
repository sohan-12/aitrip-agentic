import { Suspense, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Group, MathUtils, Vector3 } from 'three'
import type { EarthTarget } from './Earth'

type Props = {
  view: { latitude: number; longitude: number; zoom: number }
  target?: EarthTarget | null
  enabled: boolean
  motion: boolean
  spin: boolean
  autoOffset: number
  spinOffset: RefObject<number>
  onReady: () => void
  onFailure: () => void
}

const vertex = `
varying vec2 coord;
varying vec3 vNormal;
varying vec3 sight;
void main(){
  coord = uv;
  vNormal = normalMatrix * normal;
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  sight = -p.xyz;
  gl_Position = projectionMatrix * p;
}`

const fragment = `
uniform sampler2D surface;
uniform sampler2D lights;
varying vec2 coord;
varying vec3 vNormal;
varying vec3 sight;
void main(){
  vec3 n = normalize(vNormal);
  vec3 sun = normalize(vec3(-0.64, 0.63, 0.40));
  float day = max(dot(n, sun), 0.0);
  vec3 land = texture2D(surface, coord).rgb;
  land = mix(land, vec3(dot(land, vec3(.299,.587,.114))), .20);
  vec3 color = land * (.21 + .92 * day) * vec3(.91,1.05,1.13);
  color += texture2D(lights, coord).rgb * pow(1.0 - day, 3.5) * .52;
  float rim = pow(1.0 - max(dot(n, normalize(sight)), 0.0), 3.7);
  color += vec3(.13, .58, .95) * rim * (.44 + .53 * day);
  gl_FragColor = vec4(color, 1.0);
}`

function Planet({ view, target, enabled, motion, spin, spinOffset, autoOffset, onReady }: Props) {
  const globe = useRef<Group>(null)
  const started = useRef(false)
  const [surface, lights] = useTexture(['/earth/surface.webp', '/earth/night.webp'])
  const invalidate = useThree(state => state.invalidate)
  const size = useThree(state => state.size)
  const aspect = size.width / Math.max(1, size.height)

  useEffect(() => { invalidate() }, [view, spin, enabled, invalidate])
  useFrame((_, dt) => {
    const group = globe.current
    if (!group || !enabled) return
    const delta = Math.min(dt, 0.065)
    if (spin) spinOffset.current += delta * 1.25
    const lon = view.longitude + (spin ? spinOffset.current : autoOffset)
    const yaw = MathUtils.degToRad(-lon - 90)
    const pitch = MathUtils.degToRad(view.latitude)
    const shortAngle = Math.atan2(Math.sin(yaw-group.rotation.y), Math.cos(yaw-group.rotation.y))
    const factor = motion && started.current ? 1 - Math.exp(-delta * 9) : 1
    group.rotation.y += shortAngle * factor
    group.rotation.x += (pitch - group.rotation.x) * factor
    const scale = Math.min(1, aspect) * view.zoom
    group.scale.setScalar(MathUtils.lerp(group.scale.x, scale, factor))
    if (!started.current) { started.current = true; onReady() }
    if (spin || Math.abs(shortAngle) + Math.abs(pitch-group.rotation.x) + Math.abs(group.scale.x-scale) > .0001) invalidate()
  })

  let marker: Vector3 | undefined
  if (target) {
    const lat = MathUtils.degToRad(target.latitude)
    const lon = MathUtils.degToRad(target.longitude)
    marker = new Vector3(Math.cos(lat)*Math.cos(lon), Math.sin(lat), -Math.cos(lat)*Math.sin(lon)).multiplyScalar(1.009)
  }
  return <group ref={globe}>
    <mesh>
      <sphereGeometry args={[1, 96, 64]} />
      <shaderMaterial uniforms={{ surface: { value: surface }, lights: { value: lights } }} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
    {marker && <mesh position={marker}>
      <sphereGeometry args={[.015, 12, 8]} /><meshBasicMaterial color="#70f8ff" toneMapped={false} />
    </mesh>}
  </group>
}

export default function EarthScene(props: Props) {
  return <Canvas className="earth-canvas" aria-hidden="true" dpr={[1, 1.65]} frameloop="demand"
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    camera={{ fov: 36, position: [0, 0, 3.74], near: .1, far: 10 }}
    onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', props.onFailure, { once: true })}>
    <Suspense fallback={null}><Planet {...props} /></Suspense>
  </Canvas>
}

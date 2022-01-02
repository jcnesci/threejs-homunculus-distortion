uniform float time;
uniform float progress;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

void main() {
  // vec4 color = texture2D(uTexture, vUv);
  
  // vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
  gl_FragColor = vec4(vUv, 0., 1.);
  // gl_FragColor = color;
}
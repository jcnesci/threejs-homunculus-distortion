import { Vector2 } from "three";

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const CustomPass = {
  uniforms: {
    time: { value: 0 },
    progress: { value: 0 },
		tDiffuse: { value: null },
    tSize: { value: new Vector2(256, 256) },
    center: { value: new Vector2(0.5, 0.5) },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float time;
		uniform float progress;
		uniform vec2 center;
		uniform float angle;
		uniform float scale;
		uniform vec2 tSize;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		float pattern() {

			float s = sin( angle ), c = cos( angle );

			vec2 tex = vUv * tSize - center;
			vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;

			return ( sin( point.x ) * sin( point.y ) ) * 4.0;

		}

		void main() {

			// vec4 color = texture2D( tDiffuse, vUv );

			// float average = ( color.r + color.g + color.b ) / 3.0;

			// gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );

			vec2 centeredUV = 2. * vUv - vec2(1.);
			vec2 newUV = vUv + centeredUV*vec2(1.,0.);
			newUV.x = mix(vUv.x, length(centeredUV), progress);
			newUV.y = mix(vUv.y, 0., progress);
			vec4 color = texture2D( tDiffuse, newUV );
			gl_FragColor = color;
		}`,
};

export { CustomPass };

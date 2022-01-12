import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";
// import gsap from "gsap";

const img1 = new URL("./img/1.jpeg", import.meta.url);
const img2 = new URL("./img/2.jpeg", import.meta.url);
const img3 = new URL("./img/3.jpeg", import.meta.url);

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { CustomPass } from "./js/CustomPass.js";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    // Orthographic camera is better for specifying exact sizes of objects in pixels.
    // const frustrumSize = this.height;
    // const aspect = this.width / this.height;
    // this.camera = new THREE.OrthographicCamera(
    //   (frustrumSize * aspect) / -2,
    //   (frustrumSize * aspect) / 2,
    //   frustrumSize / 2,
    //   frustrumSize / -2,
    //   -1000,
    //   1000
    // );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.imgUrls = [img1.pathname, img2.pathname, img3.pathname];
    this.imgTextures = this.imgUrls.map((url) =>
      new THREE.TextureLoader().load(url)
    );

    this.initPost();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  initPost() {
    // postprocessing

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.effect1 = new ShaderPass(CustomPass);
    this.composer.addPass(this.effect1);
  }

  settings() {
    this.settings = {
      progress: 0,
      scale: 1,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "scale", 0, 10, 0.1);
  }

  setupResize() {
    window.addEventListener("resize", this.setupResize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: this.imgTextures[0] },
        // uTexture: { value: new THREE.TextureLoader().load(image.pathname) },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      // side: THREE.DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    //NB: 1.9 is image's aspect ratio, hardcoded here instead of remapping UVs in shader, easier.
    this.geometry = new THREE.PlaneGeometry(1.9 / 2, 1 / 2, 1, 1);

    this.meshes = [];

    this.imgTextures.forEach((t, i) => {
      let material = this.material.clone();
      material.uniforms.uTexture.value = t;
      let mesh = new THREE.Mesh(this.geometry, material);
      this.scene.add(mesh);
      this.meshes.push(mesh);
      mesh.position.x = i - 1; //NB: simple positioning, not ideal.
    });
  }

  render() {
    // TRICK: rotate image meshes as we increase progress, so they start-out unrotated but end-up rotated to get the desired distortion effect!
    this.meshes.forEach(m => {
      // m.position.y = -this.settings.progress;
      m.rotation.z = this.settings.progress * Math.PI/2;
    });
    this.time += 0.01;
    this.material.uniforms.time.value = this.time;
    this.effect1.uniforms["time"].value = this.time;
    this.effect1.uniforms["progress"].value = this.settings.progress;
    this.effect1.uniforms["scale"].value = this.settings.scale;
    window.requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container"),
});

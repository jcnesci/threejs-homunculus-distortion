import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import * as dat from "dat.gui";
// import gsap from "gsap";
const img1 = new URL("./img/1.jpeg", import.meta.url);
const img2 = new URL("./img/2.jpeg", import.meta.url);
const img3 = new URL("./img/3.jpeg", import.meta.url);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xffffff, 1);
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

    this.isPlaying = true;

    this.imgUrls = [img1.pathname, img2.pathname, img3.pathname];
    this.imgTextures = this.imgUrls.map((url) =>
      new THREE.TextureLoader().load(url)
    );

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.setupResize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover (?)
    // this.imageAspect = 853 / 1280;
    // let a1, a2;
    // if (this.height / this.width > this.imageAspect) {
    //   a1 = (this.width / this.height) * this.imageAspect;
    //   a2 = 1;
    // } else {
    //   a1 = 1;
    //   a2 = this.height / this.width / this.imageAspect;
    // }
    // this.material.uniforms.resolution.value.x = this.width;
    // this.material.uniforms.resolution.value.y = this.height;
    // this.material.uniforms.resolution.value.z = a1;
    // this.material.uniforms.resolution.value.w = a2;

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

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.getElementById("container"),
});

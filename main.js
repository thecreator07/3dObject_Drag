import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { color } from "three/examples/jsm/nodes/Nodes.js";
// import { DragControls } from "three/examples/jsm/controls/DragControls.js";


const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 30, 50);
const Control = new OrbitControls(camera, renderer.domElement);


// const spotLight = new THREE.SpotLight(0xffffff, 5000, 700);
// scene.add(spotLight);
// spotLight.position.set(-50, 60, 30);
// spotLight.castShadow = true;


const directionallight = new THREE.DirectionalLight(0xffffff, 1)
directionallight.position.set(-10, 50, 0)
scene.add(directionallight)
directionallight.castShadow = true
directionallight.shadow.mapSize.width = 2048
directionallight.shadow.mapSize.length = 2048
directionallight.shadow.camera.left = -50
directionallight.shadow.camera.right = 50
directionallight.shadow.camera.top = 50
directionallight.shadow.camera.bottom = -50



const roomsize = Math.sqrt(10000)

const stdObject = (geometry, name, color = Math.random() * 0xffffff, doubleside) => {
  const boxgeo = geometry;
  const matbox = new THREE.MeshStandardMaterial({
    color: color,
    // wireframe: false,
  });
  if (doubleside === true) {
    matbox.side = THREE.DoubleSide;
  }
  const object = new THREE.Mesh(boxgeo, matbox);
  object.receiveShadow = true
  object.castShadow = true
  object.userData.draggable = true//we can customize the userdata
  object.userData.name = `${name}`
  return object;
};



const surface = new THREE.Mesh(new THREE.PlaneGeometry(roomsize, roomsize, 5),
  new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }))
surface.rotation.x = -Math.PI / 2
surface.userData.ground = true
surface.userData.name = "ground"
scene.add(surface)
surface.receiveShadow = true


const box1 = stdObject(new THREE.BoxGeometry(roomsize / 10, roomsize / 10, roomsize / 10), "box1")
scene.add(box1)
box1.position.set(30, 5, 30)
const box2 = stdObject(new THREE.BoxGeometry(roomsize / 10, roomsize / 10, roomsize / 10), "box2")
scene.add(box2)
box2.position.set(-30, 5, 30)
const box3 = stdObject(new THREE.BoxGeometry(roomsize / 10, roomsize / 10, roomsize / 10), "box3")
scene.add(box3)
box3.position.set(30, 5, -30)
const box4 = stdObject(new THREE.BoxGeometry(roomsize / 10, roomsize / 10, roomsize / 10), "box4")
scene.add(box4)
box4.position.set(-30, 5, -30)


const sphere = stdObject(new THREE.SphereGeometry(roomsize / 20, 20, 20), "sphere")
sphere.position.set(0, 5, 0)
scene.add(sphere)



const raycaster = new THREE.Raycaster()
const clickMouse = new THREE.Vector2()
const moveMouse = new THREE.Vector2()
let draggable
// console.log(draggable)
window.addEventListener('click', (event) => {
  //if dragobject has already been select(click) ,then draggable will become null  
  if (draggable) {
    console.log(`dropping draggable ${draggable.userData.name}`)
    draggable = null
    return;
  }
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(clickMouse, camera)
  const found = raycaster.intersectObjects(scene.children)

  if (found.length > 0 && found[0].object.userData.draggable) {
    draggable = found[0].object
    console.log(`found draggable ${draggable.userData.name}`)
  }

})


window.addEventListener('mousemove', (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
})

const dragobject = () => {
  if (draggable != null) {
    raycaster.setFromCamera(moveMouse, camera)
    const found = raycaster.intersectObjects(scene.children)
    if (found.length > 0) {
      for (const obj of found) {
        if (!obj.object.userData.ground) continue
        draggable.position.x = obj.point.x
        draggable.position.z = obj.point.z
      }
    }
  }
}


//Animation loop
const animate = () => {

  dragobject()
  renderer.render(scene, camera);

  // Control.update();
};

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
renderer.setAnimationLoop(animate);

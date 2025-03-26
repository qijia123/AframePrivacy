// Joystick movement component: moves the rig based on thumbstick input on the left controller.
AFRAME.registerComponent("joystick-movement", {
    schema: { speed: { type: "number", default: 1.5 } },
    init() {
      this.joystick = { x: 0, y: 0 };
      document.querySelector("#leftHand").addEventListener("thumbstickmoved", evt => {
        this.joystick = { x: evt.detail.x, y: evt.detail.y };
      });
    },
    tick(time, deltaTime) {
      const dt = deltaTime / 1000;
      const rigEl = this.el;
      const rigRotation = rigEl.getAttribute("rotation").y;
      const inputVector = new THREE.Vector3(this.joystick.x, 0, this.joystick.y);
      const quat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(rigRotation)
      );
      inputVector.applyQuaternion(quat).multiplyScalar(this.data.speed * dt);
      rigEl.object3D.position.add(inputVector);
    }
  });
      // Joystick rotation component: rotates the rig based on thumbstick input on the right controller.
      AFRAME.registerComponent("joystick-rotation", {
        schema: { speed: { type: "number", default: 45 } },
        init() {
          this.rotationInput = 0;
          document.querySelector("#rightHand").addEventListener("thumbstickmoved", evt => {
            this.rotationInput = evt.detail.x;
          });
        },
        tick(time, deltaTime) {
          const dt = deltaTime / 1000;
          const rigEl = document.querySelector("#rig");
          let currentRotation = rigEl.getAttribute("rotation");
          currentRotation.y += this.rotationInput * this.data.speed * dt;
          rigEl.setAttribute("rotation", currentRotation);
        }
      });
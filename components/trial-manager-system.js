// Trial checker component: monitors the cube position and checks if the trial is completed.
AFRAME.registerSystem("trial-manager", {
  init() {
    this.STATES = {
      WELCOME: "WELCOME",
      CALIBRATE: "CALIBRATE",
      MOVINGOBJECT: "MOVINGOBJECT",
      FINISH: "FINISH"
    };

    this.experimentState = this.STATES.WELCOME,
      this.trialCounter = 0,
      this.totalTrials = 5,
      this.currentCube = null,
      this.currentTarget = null,
      this.cubeInitialPosition = null,
      this.cubeGrabbed = false;
    this.uiTextEl = document.querySelector("#uiText");
    this.sceneEl = this.el;

    // Controller event listeners to transition between states.
    const rightHandEl = document.querySelector("#rightHand");
    rightHandEl.addEventListener("gripdown", () => {
      if (this.experimentState === this.STATES.WELCOME) {
        console.log("Right controller grip pressed. Advancing to CALIBRATE.");
        this.enterState(this.STATES.CALIBRATE);
      }
    });
    rightHandEl.addEventListener("triggerdown", () => {
      if (this.experimentState === this.STATES.CALIBRATE) {
        console.log("Right controller trigger pressed. Calibrating and advancing to MOVINGOBJECT.");
        document.querySelector("#rig").setAttribute("position", "0 1.6 0");
        this.enterState(this.STATES.MOVINGOBJECT);
      }
    });


    this.enterState(this.experimentState);

  },

  updateUIText: function (text) {
    if (this.uiTextEl) {
      this.uiTextEl.setAttribute("value", text);
    }
  },

  enterState: function (state) {
    this.experimentState = state;
    switch (state) {
      case this.STATES.WELCOME:
        this.updateUIText(
          "Welcome!\nUse your right controller grip to pick up a cube and move it to the red target area.\nDo this 5 times.\nPress the right controller grip to continue."
        );
        setTimeout(() => {
          this.enterState(this.STATES.MOVINGOBJECT);
        }, 1000);
        break;

      case this.STATES.CALIBRATE:
        this.updateUIText("Calibrate:\nHold your right controller against your chest and press the trigger.");
        break;

      case this.STATES.MOVINGOBJECT:
        this.updateUIText(`Trial ${this.trialCounter + 1}:\nGrab the green cube and move it to the red target area.\nRelease the grip to drop it.`);
        this.startCubeTrial();
        break;

      case this.STATES.FINISH:
        this.updateUIText("Task completed!\nThank you for participating.");
        break;
    }
  },

  startCubeTrial: function () {
    // Remove any existing cube or target from previous trial.
    if (this.currentCube) { this.sceneEl.removeChild(this.currentCube); }
    if (this.currentTarget) { this.sceneEl.removeChild(this.currentTarget); }

    // Create the cube.
    this.currentCube = document.createElement("a-box");
    this.currentCube.setAttribute("color", "green");
    this.currentCube.setAttribute("depth", "1");
    this.currentCube.setAttribute("height", "1");
    this.currentCube.setAttribute("width", "1");
    this.currentCube.setAttribute("dynamic-body", "shape: box;");
    this.currentCube.setAttribute("grabbable", "");
    this.currentCube.setAttribute("disable-physics-on-grab", "");
    // this.currentCube.classList.add("grabbable");
    this.currentCube.setAttribute("position", "0 1.6 -2");
    this.cubeInitialPosition = new THREE.Vector3(0, 1.6, -2);

    // Optionally add event listeners.
    this.currentCube.addEventListener("grab-start", () => console.log("Grab started"));
    this.currentCube.addEventListener("grab-end", () => console.log("Grab ended"));

    this.sceneEl.appendChild(this.currentCube);

    // Update the sphere collider on the right hand.
    const rightHandEl = document.querySelector("#rightHand");
    if (rightHandEl && rightHandEl.components["sphere-collider"]) {
      rightHandEl.components["sphere-collider"].update();
    }

    // Create the target.
    this.currentTarget = document.createElement("a-box");
    this.currentTarget.setAttribute("color", "red");
    this.currentTarget.setAttribute("depth", "1.5");
    this.currentTarget.setAttribute("height", "1.5");
    this.currentTarget.setAttribute("width", "1.5");
    this.currentTarget.setAttribute("position", "3 2.5 -2");
    this.currentTarget.setAttribute("material", "opacity: 0.3; transparent: true; wireframe: true;");
    this.sceneEl.appendChild(this.currentTarget);

    // Reset trial-specific flags.
    this.cubeGrabbed = false;
  },

  // Call this function when the trial has been successfully completed.
  completeTrial: function () {
    this.trialCounter++;
    if (this.trialCounter >= this.totalTrials) {
      this.enterState(this.STATES.FINISH);
    } else {
      this.enterState(this.STATES.MOVINGOBJECT);
    }
  },

  tick() {
    if (!(this.sceneEl.is("vr-mode"))) return;

    if (this.experimentState === this.STATES.MOVINGOBJECT && this.currentCube && this.currentTarget) {
      //   const cubePos = new THREE.Vector3();
      //   this.currentCube.object3D.getWorldPosition(cubePos);
      //   if (!this.cubeGrabbed && cubePos.distanceTo(this.cubeInitialPosition) > 0.05) {
      //     this.cubeGrabbed = true;
      //   }
      //   console.log(this.cubeGrabbed);
      //   if (this.cubeGrabbed) {
      //     const targetPos = new THREE.Vector3();
      //     this.currentTarget.object3D.getWorldPosition(targetPos);
      //     if (cubePos.distanceTo(targetPos) < 0.15) {
      //       this.trialCounter++;
      //       this.currentCube.remove();
      //       this.currentTarget.remove();
      //       this.currentCube = currentTarget = null;
      //       this.cubeGrabbed = false;
      //       setTimeout(() => {
      //         this.enterState(this.trialCounter < this.totalTrials ? this.STATES.MOVINGOBJECT : this.STATES.FINISH);
      //       }, 500);
      //     }
      //   }
    }
  }
});
// Trial checker component: monitors the cube position and checks if the trial is completed.
AFRAME.registerSystem("trial-manager", {
  init() {
    this.STATES = {
      WELCOME: "WELCOME",
      CALIBRATE: "CALIBRATE",
      MOVINGOBJECT: "MOVINGOBJECT",
      TOUCHINGOBJECT: "TOUCHINGOBJECT",
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
          "Welcome!\nPress the right controller grip to continue."
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
      
      case this.STATES.TOUCHINGOBJECT:
        // Show all text (banner/instructions) for touching object stage.
        this.updateUIText("Trial Complete!\n\nNow, touch the blue sphere for xxx times.\n\nUse either your left or right hand to touch the sphere.");
        this.spawnTouchingSphere();
        break;

      case this.STATES.FINISH:
        this.updateUIText("Task completed!\nThank you for participating.");
        break;
    }
  },

  startCubeTrial: function () {
    // // Remove any existing cube or target from previous trial.
    if (this.currentCube) { this.sceneEl.removeChild(this.currentCube); }
    if (this.currentTarget) { this.sceneEl.removeChild(this.currentTarget); }

    // Create the cube.
    //<a-entity class="cube" mixin="cube" position="0 1.6 -1.25" material="color: red"></a-entity>
    this.currentCube = document.createElement("a-entity");
    this.currentCube.setAttribute("material", "color: green");
    this.currentCube.setAttribute("mixin", "cube");
    this.currentCube.setAttribute("class", "cube");
    this.currentCube.setAttribute("position", "0 1.6 -1.25");
    this.cubeInitialPosition = new THREE.Vector3(0, 1.6, -1.25);

    // // Optionally add event listeners.
    // this.currentCube.addEventListener("grab-start", () => console.log("Grab started"));
    // this.currentCube.addEventListener("grab-end", () => console.log("Grab ended"));

    this.sceneEl.appendChild(this.currentCube);

    // // Update the sphere collider on the right hand.
    // const rightHandEl = document.querySelector("#rightHand");
    // if (rightHandEl && rightHandEl.components["sphere-collider"]) {
    //   rightHandEl.components["sphere-collider"].update();
    // }

    // Create the target.
    // <a-entity class="target" mixin="target" position = "-1 1.6 -1"
    //             material="src:#colortransform" shadow></a-entity>
    this.currentTarget = document.createElement("a-entity");
    this.currentTarget.setAttribute("material", "color: red");
    this.currentTarget.setAttribute("mixin", "target");
    this.currentTarget.setAttribute("class", "target");
    this.currentTarget.setAttribute("position", "-1 1.6 -1");
    this.sceneEl.appendChild(this.currentTarget);

    // // Reset trial-specific flags.
    this.cubeGrabbed = false;
  },


  spawnTouchingSphere() {
    // Create the blue sphere that should appear only in this state.
    const sphere = document.createElement("a-sphere");
    sphere.setAttribute("position", "0 1.5 -1"); // adjust position as needed
    sphere.setAttribute("radius", "0.1");
    sphere.setAttribute("color", "blue");
    sphere.setAttribute("dynamic-body", "mass: 0");
    sphere.setAttribute("collision-filter", "collisionForces: false");
    sphere.setAttribute("disappear-on-touch", "");

    sphere.addEventListener("sphere-touched", () => {
      this.completeTrial();
    });

    this.sceneEl.appendChild(sphere);
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
    if (!this.sceneEl.is("vr-mode")) return;
    if (this.experimentState === this.STATES.MOVINGOBJECT && this.currentCube && this.currentTarget) {
      const cubePos = new THREE.Vector3();
      this.currentCube.object3D.getWorldPosition(cubePos);
      if (!this.cubeGrabbed && cubePos.distanceTo(this.cubeInitialPosition) > 0.05) {
        this.cubeGrabbed = true;
      }
      if (this.cubeGrabbed) {
        const targetPos = new THREE.Vector3();
        this.currentTarget.object3D.getWorldPosition(targetPos);
        if (cubePos.distanceTo(targetPos) < 0.15) {
          // Remove cube and target.
          if (this.currentCube.parentNode) { this.sceneEl.removeChild(this.currentCube); }
          if (this.currentTarget.parentNode) { this.sceneEl.removeChild(this.currentTarget); }
          this.currentCube = null;
          this.currentTarget = null;
          this.cubeGrabbed = false;
          // Now that the cube trial is complete, move to TOUCHINGOBJECT state.
          this.enterState(this.STATES.TOUCHINGOBJECT);
        }
      }
    }
  }
});


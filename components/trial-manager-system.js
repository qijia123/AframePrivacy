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
    this.onTarget = false;
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

    this.currentCube.addEventListener("drag-drop", (evt) => {
      setTimeout(() => this.completeTrial(), 500);
    });

    this.sceneEl.appendChild(this.currentCube);

    // Create the target.
    // <a-entity class="target" mixin="target" position = "-1 1.6 -1"
    //             material="src:#colortransform" shadow></a-entity>
    this.currentTarget = document.createElement("a-entity");
    this.currentTarget.setAttribute("material", "color: red");
    this.currentTarget.setAttribute("mixin", "target");
    this.currentTarget.setAttribute("class", "target");
    this.currentTarget.setAttribute("position", "-1 1.6 -1");
    this.sceneEl.appendChild(this.currentTarget);
  },

  // Call this function when the trial has been successfully completed.
  completeTrial: function () {
    this.trialCounter++;
    this.trialCounter === this.totalTrials
    ? this.enterState(this.STATES.FINISH)
    : this.enterState(this.STATES.MOVINGOBJECT);
  },

  tick() {
    // if (!(this.sceneEl.is("vr-mode"))) return;
  }
});
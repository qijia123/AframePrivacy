AFRAME.registerComponent('disappear-on-touch', {
    init: function () {
      const removeIfHand = (evt) => {
        let target;
  
        if (evt.detail && evt.detail.targetEl)
          target = evt.detail.targetEl;
        else if (evt.detail && evt.detail.body && evt.detail.body.el)
          target = evt.detail.body.el;
  
        if (!target) { return; }
  
        if (target.id === 'leftHand' || target.id === 'rightHand') {
          // Schedule removal on next tick to avoid mid-collision issues.
          this.el.emit('sphere-touched'); //Linkling to timer.

          setTimeout(() => {
            if (this.el.parentNode) {
              this.el.parentNode.removeChild(this.el);
            }
          }, 0);
        }
      };
  
      //this.el.addEventListener('hitstart', removeIfHand);
      this.el.addEventListener('collide', removeIfHand);
    }
  });
  
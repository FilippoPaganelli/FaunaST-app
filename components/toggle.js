import React from 'react';
import ToggleSwitch from 'rn-toggle-switch';

class Toggle extends ToggleSwitch {
  onDragEnd = e => {
    const {contentOffset} = e.nativeEvent;
    if (contentOffset.x > this.props.width / 2) {
      this.scrollRef.scrollToEnd();
      this.updateState(false);
    } else {
      this.scrollRef.scrollTo({x: 0, y: 0, animated: true});
      this.updateState(true);
    }
  };

  onDragStart = () => {};
}

export default Toggle;

import React, { Component } from 'react'
import { View, Animated, PanResponder, Dimensions } from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;
class Deck extends Component {
  static defaultProps = {
      onSwipeLeft: () => {},
      onSwipeRight: () => {}
  }

  constructor(props){
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx , y: gesture.dy })
      },
      onPanResponderRelease: (event, gesture) => {
        if(gesture.dx > SWIPE_THRESHOLD){
          this.forceSwipe(SCREEN_WIDTH);
        }else if(gesture.dx < -SWIPE_THRESHOLD){
          this.forceSwipe(-SCREEN_WIDTH);
        }else{
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index:0 };
  }

  forceSwipe(distance){
    Animated.timing(this.state.position, {
      toValue: {x: distance, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => {
      //callback function when animation is over
      this.onSwipeComplete(distance);
    });
  }

  onSwipeComplete(distance){
    const right = distance > 0 ? true : false;
    const { onSwipeRight, onSwipeLeft, data } = this.props;
    const item = data[this.state.index]
    if(right){
      onSwipeRight(item);
    }else{
      onSwipeLeft(item);
    }
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: {x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH,0,SCREEN_WIDTH],
      outputRange: ['-55deg','0deg','55deg']
    });
    return {
      ... position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards(){
    return this.props.data.map((item, index) => {
      if( index === 0 ){
          return (
            <Animated.View
              key={item.id}
              {... this.state.panResponder.panHandlers}
              style={this.getCardStyle()}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
      }
      return this.props.renderCard(item);
    });
  }
  render(){
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;

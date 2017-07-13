import React, { Component } from 'react'
import { View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;
const CARD_SCREEN = 20;
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
          this.forceSwipe(-SCREEN_WIDTH + CARD_SCREEN);
        }else{
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index:0 };
  }

  componentWillReceiveProps(nextProps){
      if(nextProps.data !== this.props.data){
        this.setState({ index: 0 });
      }
  }

  componentWillUpdate() {
      UIManager.setLayoutAnimationEnabledExperimental
      && UIManager.setLayoutAnimationEnabledExperimental(true);

      LayoutAnimation.linear();
  }

  forceSwipe(distance){
    Animated.timing(this.state.position, {
      toValue: {x: distance, y: 0 },
      duration: SWIPE_OUT_DURATION*1000
    }).start(() => {
      //callback function when animation is over
      this.onSwipeComplete(distance);
    });
  }

  onSwipeComplete(distance){
    const { index, position } = this.state;
    const right = distance > 0 ? true : false;
    const { onSwipeRight, onSwipeLeft, data } = this.props;
    const item = data[index]
    if(right){
      onSwipeRight(item);
    }else{
      onSwipeLeft(item);
    }
    position.setValue({ x:0, y:0 });
    this.setState({ index: index + 1});
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: {x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    //const rotate = position.x.interpolate({
    //  inputRange: [-SCREEN_WIDTH,0,SCREEN_WIDTH],
    //  outputRange: ['-55deg','0deg','55deg']
    //});
    return {
      ... position.getLayout()
      //transform: [{ rotate }]
    };
  }

  renderCards(){
    const { index } = this.state;
    if(index >= this.props.data.length){
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < index) { return null;}
      if( i === index ){
          return (
            <Animated.View
              key={item.id}
              {... this.state.panResponder.panHandlers}
              style={[this.getCardStyle(),styles.cardStyle]}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
      }
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { left: SCREEN_WIDTH - CARD_SCREEN }]}
          >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }


  render(){
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

export default Deck;

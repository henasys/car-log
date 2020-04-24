/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, I18nManager} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
const buttonWidth = 64;
const rightButtonCount = 2;
const leftButtonCount = 1;

export default class SwipeableRow extends Component {
  renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const actionStyle = this.props.transform
      ? {...styles.leftAction, ...{transform: [{scaleY: -1}]}}
      : styles.leftAction;
    return (
      <View
        style={{
          width: buttonWidth * leftButtonCount,
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        }}>
        <RectButton style={actionStyle} onPress={this.close}>
          <AnimatedIcon
            name="pin"
            size={30}
            color="#fff"
            style={[styles.actionIcon, {transform: [{scale}]}]}
          />
        </RectButton>
      </View>
    );
  };
  renderRightAction = (text, color, x, progress, callback = null) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      this.close();
      callback && callback();
    };
    const actionStyle = this.props.transform
      ? {...styles.rightAction, ...{transform: [{scaleY: -1}]}}
      : styles.rightAction;
    return (
      <Animated.View style={{flex: 1, transform: [{translateX: trans}]}}>
        <RectButton
          style={[actionStyle, {backgroundColor: color}]}
          onPress={pressHandler}>
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };
  renderRightActions = progress => (
    <View
      style={{
        width: buttonWidth * rightButtonCount,
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
      }}>
      {this.renderRightAction(
        '닫기',
        '#ffab00',
        buttonWidth * rightButtonCount,
        progress,
      )}
      {this.renderRightAction('삭제', '#dd2c00', buttonWidth, progress, () => {
        this.props.onDeleteRow && this.props.onDeleteRow(this.props.rowKey);
      })}
    </View>
  );
  updateRef = ref => {
    this._swipeableRow = ref;
  };
  close = () => {
    this._swipeableRow.close();
  };
  render() {
    const {children} = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions.bind(this)}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#388e3c',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 30,
    marginHorizontal: 10,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

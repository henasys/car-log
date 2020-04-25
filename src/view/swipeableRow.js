/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View, I18nManager} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import MyAlert from '../view/alert';
import {getDetailDataRow} from '../module/bundleData';

const buttonWidth = 64;
const rightButtonCount = 2;

export default class SwipeableRow extends Component {
  constructor(props) {
    super(props);
    // console.log('props.rowItem', props.rowItem);
    this.tripData = getDetailDataRow(props.rowItem);
    // console.log('tripData', this.tripData);
  }
  getTripBriefMessage() {
    if (this.tripData) {
      const trip = this.tripData;
      const messages = [];
      messages.push(`출발: ${trip.startHour}`);
      messages.push(`도착: ${trip.endHour}`);
      messages.push(`거리: ${trip.distance} km`);
      return messages.join('\n');
    }
    return null;
  }
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
        this.props.transform ? '아래와 합치기' : '위쪽과 합치기',
        '#ffab00',
        buttonWidth * rightButtonCount,
        progress,
        () => {
          this.props.onMergeRow &&
            this.props.onMergeRow(this.props.rowKey, this.props.rowIndex);
        },
      )}
      {this.renderRightAction('삭제', '#dd2c00', buttonWidth, progress, () => {
        const title = `운행기록 삭제: ${this.tripData.date}`;
        const message = this.getTripBriefMessage();
        const okCallback = () => {
          this.props.onDeleteRow && this.props.onDeleteRow(this.props.rowKey);
        };
        const cancelCallback = () => {};
        MyAlert.showTwoButtonAlert(title, message, okCallback, cancelCallback);
      })}
    </View>
  );
  onSwipeableLeftOpen = () => {
    console.log('onSwipeableLeftOpen');
    this.props.onSwipeableLeftOpen &&
      this.props.onSwipeableLeftOpen(this.props.rowKey, this.props.rowIndex);
  };
  onSwipeableClose = () => {
    console.log('onSwipeableClose');
    this.props.onSwipeableClose &&
      this.props.onSwipeableClose(this.props.rowKey, this.props.rowIndex);
  };
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
        renderRightActions={this.renderRightActions.bind(this)}
        onSwipeableLeftOpen={this.onSwipeableLeftOpen.bind(this)}
        onSwipeableClose={this.onSwipeableClose.bind(this)}>
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

import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedProps,
} from 'react-native-reanimated';
import {HitSlop} from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';
import Svg, {Circle} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type IStatus = 'init' | 'refreshing' | 'done';
interface Props {
  isLoading: boolean;
  onRefresh: () => void;
  refreshHeight?: number;
  defaultAnimationEnabled?: boolean;
  contentOffset?: Animated.SharedValue<number>;
  children: JSX.Element;
  bounces?: boolean;
  hitSlop?: HitSlop;
  managedLoading?: boolean;
}

const RefreshableWrapper = ({
  isLoading,
  onRefresh,
  refreshHeight = 100,
  defaultAnimationEnabled,
  contentOffset,
  children,
  bounces = true,
  hitSlop,
  managedLoading = false,
}: Props) => {
  const [status, setStatus] = useState<IStatus>('init');
  const isRefreshing = useSharedValue(false);
  const loaderOffsetY = useSharedValue(0);
  const listContentOffsetY = useSharedValue(0);
  const isLoaderActive = useSharedValue(false);

  useEffect(() => {
    if (!isLoading) {
      loaderOffsetY.value = withTiming(0);
      isRefreshing.value = false;
      isLoaderActive.value = false;
    } else if (managedLoading) {
      loaderOffsetY.value = withTiming(refreshHeight);
      isRefreshing.value = true;
      isLoaderActive.value = true;
    }
    if (isLoading) {
      setStatus('refreshing');
    } else if (status === 'refreshing') {
      setStatus('done');
    } else if (status === 'done') {
      setTimeout(() => {
        setStatus('init');
      }, 1000);
    }
  }, [
    isLoading,
    isLoaderActive,
    isRefreshing,
    loaderOffsetY,
    managedLoading,
    refreshHeight,
    status,
  ]);

  const onScroll = useAnimatedScrollHandler((event: NativeScrollEvent) => {
    const y = event.contentOffset.y;

    listContentOffsetY.value = y;

    if (children.props.onScroll) {
      runOnJS(children.props.onScroll)(event);
    }
  });

  const native = Gesture.Native();

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      'worklet';
      isLoaderActive.value = loaderOffsetY.value > 0;
      //   setOffsetY(event.translationY);
      //   console.log(event.translationY);

      if (
        ((listContentOffsetY.value <= 0 && event.velocityY >= 0) ||
          isLoaderActive.value) &&
        !isRefreshing.value
      ) {
        loaderOffsetY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isRefreshing.value) {
        if (loaderOffsetY.value >= refreshHeight && !isRefreshing.value) {
          isRefreshing.value = true;
          runOnJS(onRefresh)();
        } else {
          isLoaderActive.value = false;
          loaderOffsetY.value = withTiming(0);
        }
      }
    });

  if (hitSlop !== undefined) {
    panGesture.hitSlop(hitSlop);
  }

  useDerivedValue(() => {
    if (contentOffset) {
      contentOffset.value = loaderOffsetY.value;
    }
  }, [loaderOffsetY]);

  const loaderAnimation = useAnimatedStyle(() => {
    return {
      height: refreshHeight,
      transform: defaultAnimationEnabled
        ? [
            {
              translateY: isLoaderActive.value
                ? interpolate(
                    loaderOffsetY.value,
                    [0, refreshHeight - 20],
                    [-10, 10],
                    Extrapolate.CLAMP,
                  )
                : withTiming(-10),
            },
            {
              scale: isLoaderActive.value ? withSpring(1) : withTiming(0.01),
            },
          ]
        : undefined,
    };
  });

  const overscrollAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: isLoaderActive.value
            ? isRefreshing.value
              ? withTiming(refreshHeight)
              : interpolate(
                  loaderOffsetY.value,
                  [0, refreshHeight],
                  [0, refreshHeight],
                  Extrapolate.CLAMP,
                )
            : withTiming(0),
        },
      ],
    };
  });

  const radius = 15;
  const strokeWidth = 4;
  const innerRadius = radius - strokeWidth / 2;
  const circumfrence = 2 * Math.PI * innerRadius;
  const animatedProps = useAnimatedProps(() => {
    if (contentOffset) {
      console.log(contentOffset.value / 100);
    }
    return {
      strokeDashoffset: contentOffset
        ? ((200 - contentOffset.value) / 200) * innerRadius * 2 * Math.PI
        : 0,
    };
  });

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.loaderContainer, loaderAnimation]}>
        {status === 'init' && (
          <>
            <Text>Swipe down to refresh</Text>
            <Svg
              height='30'
              width='30'
              viewBox='0 0 30 30'
              style={{
                transform: [{rotateZ: '270deg'}],
              }}>
              <AnimatedCircle
                cx={radius}
                cy={radius}
                r={innerRadius}
                fill={'transparent'}
                stroke={'gray'}
                strokeWidth={strokeWidth}
              />
              <AnimatedCircle
                cx={radius}
                cy={radius}
                r={innerRadius}
                fill={'transparent'}
                stroke={'blue'}
                strokeDasharray={circumfrence}
                strokeWidth={strokeWidth}
                strokeDashoffset={2 * Math.PI}
                strokeLinecap='round'
                animatedProps={animatedProps}
                style={{transform: [{rotateX: '90deg'}]}}
              />
            </Svg>
          </>
        )}
        {status === 'refreshing' && (
          <>
            <Text>Refreshing...</Text>
            <ActivityIndicator size='large' color='blue' />
          </>
        )}
        {status === 'done' && <Text>Refreshing Done</Text>}
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.flex, overscrollAnimation]}>
          <GestureDetector gesture={Gesture.Simultaneous(panGesture, native)}>
            {children &&
              React.cloneElement(children, {
                onScroll: onScroll,
                bounces: bounces,
              })}
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 5,
  },
  loader: {
    height: '100%',
    width: '100%',
  },
});

export default RefreshableWrapper;

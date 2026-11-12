import React from 'react';
import {
  Animated,
  Easing,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export type StarSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AssistantTheme = 'void' | 'oled' | 'aurora' | 'light' | 'solar';

interface StarSpinnerProps {
  size?: StarSpinnerSize;
  theme?: AssistantTheme;
  text?: string;
  isSplash?: boolean;
}

const themeGradients: Record<AssistantTheme, { stops: string[]; glow: string }> = {
  void: { stops: ['#00E5A3', '#00F0FF', '#8D80F0', '#00F0FF'], glow: 'rgba(0, 229, 163, 0.6)' },
  oled: { stops: ['#00E5A3', '#00F0FF', '#8D80F0', '#00F0FF'], glow: 'rgba(0, 229, 163, 0.7)' },
  aurora: { stops: ['#8D80F0', '#a855f7', '#e879f9', '#8D80F0'], glow: 'rgba(141, 128, 240, 0.6)' },
  light: { stops: ['#007A57', '#007C8A', '#5A4BD1', '#007C8A'], glow: 'rgba(0, 122, 87, 0.4)' },
  solar: { stops: ['#ffe600', '#fb8500', '#ff0054', '#ff5400'], glow: 'rgba(255, 183, 3, 0.7)' },
};

const sizePixels: Record<StarSpinnerSize, number> = { xs: 18, sm: 28, md: 48, lg: 72, xl: 104 };

const starPath =
  'M 50 4 C 50 28.5 71.5 50 96 50 C 71.5 50 50 71.5 50 96 C 50 71.5 28.5 50 4 50 C 28.5 50 50 28.5 50 4 Z';

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#94a3b8', fontSize: 12, fontWeight: '500', marginTop: 12, textAlign: 'center' },
  splashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#030509', padding: 16 },
  splashHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  splashDot: { width: 10, height: 10, borderRadius: 5 },
  splashTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
  splashVersion: { color: '#00f0ff', fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderRadius: 4, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderColor: 'rgba(0, 240, 255, 0.25)' },
  splashText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  splashSubtext: { color: '#64748b', fontSize: 10, fontFamily: 'monospace', textAlign: 'center', marginTop: 4 },
});

export function StarSpinner({
  size = 'md',
  theme = 'void',
  text,
  isSplash = false,
}: StarSpinnerProps) {
  const currentTheme = themeGradients[theme] ?? themeGradients.void;
  const pixelSize = sizePixels[size];

  const rotateAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const glowScaleAnim = useSharedValue(1);
  const glowOpacityAnim = useSharedValue(0.5);
  const rippleScaleAnim = useSharedValue(1);
  const rippleOpacityAnim = useSharedValue(0.6);
  const rippleRotateAnim = useSharedValue(0);

  React.useEffect(() => {
    rotateAnim.value = withRepeat(withTiming(360, { duration: 2400, easing: Easing.linear }), -1);
    scaleAnim.value = withRepeat(withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true);
    glowScaleAnim.value = withRepeat(withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    glowOpacityAnim.value = withRepeat(withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    rippleScaleAnim.value = withRepeat(withTiming(1.8, { duration: 1800, easing: Easing.out(Easing.ease) }), -1);
    rippleOpacityAnim.value = withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }), -1);
    rippleRotateAnim.value = withRepeat(withTiming(90, { duration: 1800, easing: Easing.out(Easing.ease) }), -1);
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }, { scale: scaleAnim.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScaleAnim.value }, { rotate: `${rippleRotateAnim.value}deg` }],
    opacity: rippleOpacityAnim.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScaleAnim.value }],
    opacity: glowOpacityAnim.value,
  }));

  const gradientId = `spinner-grad-${size}-${theme}`;

  if (isSplash) {
    const dotColor = currentTheme.stops[0];
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: 480, opacity: 0.3 },
            glowStyle,
          ]}
        />
        <View style={styles.splashHeader}>
          <Animated.View style={[styles.splashDot, { backgroundColor: dotColor }]} />
          <Text style={[styles.splashTitle, { color: dotColor }]}>Stella</Text>
          <Text style={[styles.splashVersion, { borderColor: dotColor + '40', color: dotColor }]}>
            v2.5 OS
          </Text>
        </View>

        <View style={{ width: pixelSize * 2.4, height: pixelSize * 2.4, alignItems: 'center', justifyContent: 'center', marginVertical: 24 }}>
          <View style={{ width: pixelSize * 2, height: pixelSize * 2 }}>
            <Svg width={pixelSize * 2} height={pixelSize * 2} viewBox="0 0 100 100">
              <Defs>
                <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {currentTheme.stops.map((color, i) => (
                    <Stop key={i} offset={`${(i / (currentTheme.stops.length - 1)) * 100}%`} stopColor={color} />
                  ))}
                </LinearGradient>
              </Defs>
              <Path d={starPath} fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
            </Svg>
          </View>
        </View>

        <Text style={styles.splashText}>{text ?? 'initializing stella'}</Text>
        <Text style={styles.splashSubtext}>Real-time voice • Multi-device mesh • AI powered</Text>
      </View>
    );
  }

  const displayText = text ?? '';

  return (
    <View style={styles.container}>
      <View style={{ width: pixelSize, height: pixelSize, position: 'relative' }}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { borderRadius: pixelSize / 2, backgroundColor: currentTheme.glow }, glowStyle]} />

        <Animated.View style={[StyleSheet.absoluteFillObject, rippleStyle]}>
          <Svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100">
            <Path d={starPath} fill="none" stroke={currentTheme.stops[0]} strokeWidth={2} strokeOpacity={0.5} />
          </Svg>
        </Animated.View>

        <Animated.View style={[starStyle, { flex: 1 }]}>
          <Svg width={pixelSize} height={pixelSize} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                {currentTheme.stops.map((color, i) => (
                  <Stop key={i} offset={`${(i / (currentTheme.stops.length - 1)) * 100}%`} stopColor={color} />
                ))}
              </LinearGradient>
            </Defs>
            <Path d={starPath} fill={`url(#${gradientId})`} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
          </Svg>
        </Animated.View>
      </View>

      {displayText && (
        <Text style={styles.text}>
          <Text style={{ color: currentTheme.stops[0] }}>●</Text> {' '}
          {displayText}
        </Text>
      )}
    </View>
  );
}
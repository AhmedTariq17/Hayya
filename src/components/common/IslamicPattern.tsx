import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Polygon, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/constants';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface IslamicPatternProps {
  type?: 'geometric' | 'arabesque' | 'calligraphy' | 'star';
  size?: number;
  color?: string;
  animated?: boolean;
  opacity?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const IslamicPattern: React.FC<IslamicPatternProps> = ({
  type = 'geometric',
  size = 200,
  color = COLORS.primary.main,
  animated = true,
  opacity = 0.1,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const pathOpacity = useSharedValue(opacity);

  useEffect(() => {
    if (animated) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 30000 }),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 5000 }),
          withTiming(1, { duration: 5000 })
        ),
        -1,
        true
      );

      pathOpacity.value = withRepeat(
        withSequence(
          withTiming(opacity * 1.5, { duration: 3000 }),
          withTiming(opacity, { duration: 3000 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: pathOpacity.value,
  }));

  const renderGeometricPattern = () => {
    const points: string[] = [];
    const numPoints = 8;
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * (size / 2);
      const y = Math.sin(angle) * (size / 2);
      points.push(`${x},${y}`);
    }

    return (
      <Svg width={size} height={size} viewBox={`-${size/2} -${size/2} ${size} ${size}`}>
        <Defs>
          <SvgLinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={COLORS.secondary.gold} stopOpacity="0.3" />
          </SvgLinearGradient>
        </Defs>
        <G>
          {[0, 45, 90, 135].map((angle, index) => (
            <AnimatedPolygon
              key={index}
              points={points.join(' ')}
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="1"
              animatedProps={animatedProps}
              transform={`rotate(${angle})`}
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((angle, index) => (
            <AnimatedCircle
              key={`circle-${index}`}
              cx="0"
              cy="0"
              r={size / 4}
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity={opacity}
              transform={`rotate(${angle})`}
              animatedProps={animatedProps}
            />
          ))}
        </G>
      </Svg>
    );
  };

  const renderStarPattern = () => {
    const createStar = (points: number, outerRadius: number, innerRadius: number) => {
      let path = '';
      const angleStep = (Math.PI * 2) / points;

      for (let i = 0; i < points; i++) {
        const outerAngle = i * angleStep - Math.PI / 2;
        const innerAngle = outerAngle + angleStep / 2;

        const outerX = Math.cos(outerAngle) * outerRadius;
        const outerY = Math.sin(outerAngle) * outerRadius;
        const innerX = Math.cos(innerAngle) * innerRadius;
        const innerY = Math.sin(innerAngle) * innerRadius;

        if (i === 0) {
          path = `M ${outerX} ${outerY}`;
        } else {
          path += ` L ${outerX} ${outerY}`;
        }
        path += ` L ${innerX} ${innerY}`;
      }
      path += ' Z';
      return path;
    };

    return (
      <Svg width={size} height={size} viewBox={`-${size/2} -${size/2} ${size} ${size}`}>
        <Defs>
          <SvgLinearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.secondary.gold} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </SvgLinearGradient>
        </Defs>
        <G>
          <AnimatedPath
            d={createStar(8, size / 2, size / 4)}
            fill="none"
            stroke="url(#starGrad)"
            strokeWidth="1.5"
            animatedProps={animatedProps}
          />
          <AnimatedPath
            d={createStar(8, size / 3, size / 6)}
            fill="none"
            stroke={COLORS.secondary.gold}
            strokeWidth="1"
            opacity={opacity * 0.7}
            animatedProps={animatedProps}
          />
          <AnimatedPath
            d={createStar(8, size / 4, size / 8)}
            fill="url(#starGrad)"
            stroke="none"
            opacity={opacity * 0.5}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    );
  };

  const renderArabesquePattern = () => {
    const createSpiral = () => {
      let path = 'M 0 0';
      const numTurns = 3;
      const pointsPerTurn = 30;

      for (let i = 0; i <= numTurns * pointsPerTurn; i++) {
        const angle = (i / pointsPerTurn) * Math.PI * 2;
        const radius = (i / (numTurns * pointsPerTurn)) * (size / 2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        path += ` L ${x} ${y}`;
      }
      return path;
    };

    return (
      <Svg width={size} height={size} viewBox={`-${size/2} -${size/2} ${size} ${size}`}>
        <Defs>
          <SvgLinearGradient id="arabesqueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="50%" stopColor={COLORS.accent.teal} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={COLORS.secondary.gold} stopOpacity="0.2" />
          </SvgLinearGradient>
        </Defs>
        <G>
          {[0, 90, 180, 270].map((angle, index) => (
            <AnimatedPath
              key={index}
              d={createSpiral()}
              fill="none"
              stroke="url(#arabesqueGrad)"
              strokeWidth="1"
              transform={`rotate(${angle})`}
              animatedProps={animatedProps}
            />
          ))}
        </G>
      </Svg>
    );
  };

  const renderPattern = () => {
    switch (type) {
      case 'star':
        return renderStarPattern();
      case 'arabesque':
        return renderArabesquePattern();
      case 'geometric':
      default:
        return renderGeometricPattern();
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderPattern()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
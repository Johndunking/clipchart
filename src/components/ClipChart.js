import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

const ClipChart = ({ initialPosition = 1, onPositionChange }) => {
  const [clipPosition, setClipPosition] = useState(initialPosition);

  useEffect(() => {
    setClipPosition(initialPosition);
  }, [initialPosition]);

  const clipUp = () => {
    if (clipPosition > 0) {
      const newPosition = clipPosition - 1;
      setClipPosition(newPosition);
      onPositionChange(newPosition);
    }
  };

  const clipDown = () => {
    if (clipPosition < 3) { // Adjust the limit according to the number of colors
      const newPosition = clipPosition + 1;
      setClipPosition(newPosition);
      onPositionChange(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.colorsContainer}>
          {['purple', 'green', 'yellow', 'red'].map((color, index) => (
            <View key={index} style={[styles.colorBlock, { backgroundColor: color }]} />
          ))}
        </View>
        <View style={[styles.clip, { top: clipPosition * 25 }]} />
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={clipUp} style={styles.clipButton}>
          <Text style={styles.clipButtonText}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clipDown} style={styles.clipButton}>
          <Text style={styles.clipButtonText}>✔️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  chartContainer: {
    position: 'relative',
    height: 100,
    width: 25, // Slightly wider for better visibility
  },
  colorsContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  colorBlock: {
    height: 25, // Adjust height to match new color scheme
    width: '100%',
  },
  clip: {
    position: 'absolute',
    width: '100%',
    height: 25,
    borderWidth: 2, // Thicker border for better visibility
    borderColor: 'black',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    marginLeft: 15,
    justifyContent: 'space-between',
    height: 100,
  },
  clipButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  clipButtonText: {
    fontSize: 20,
    color: '#000000',
  },
});

export default ClipChart;
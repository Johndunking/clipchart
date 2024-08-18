import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ClipChart = ({ className, studentName, initialPosition = 1, onPositionChange }) => {
  const [clipPosition, setClipPosition] = useState(initialPosition);

  useEffect(() => {
    const loadClipPosition = async () => {
      const classDoc = await firestore()
        .collection('classes')
        .doc(className)
        .get();
      if (classDoc.exists) {
        const studentData = classDoc.data().students?.find(s => s.name === studentName);
        if (studentData) {
          setClipPosition(studentData.clipPosition || initialPosition);
        }
      }
    };

    loadClipPosition();
  }, [className, studentName, initialPosition]);

  const updateClipPosition = async (newPosition) => {
    const classRef = firestore().collection('classes').doc(className);
    const classDoc = await classRef.get();

    if (classDoc.exists) {
      const updatedStudents = classDoc.data().students.map(student =>
        student.name === studentName
          ? { ...student, clipPosition: newPosition }
          : student
      );
      await classRef.update({ students: updatedStudents });
    }
  };

  const clipUp = () => {
    if (clipPosition > 0) {
      const newPosition = clipPosition - 1;
      setClipPosition(newPosition);
      onPositionChange(newPosition);
      updateClipPosition(newPosition);
    }
  };

  const clipDown = () => {
    if (clipPosition < 3) { // Adjust the limit according to the number of colors
      const newPosition = clipPosition + 1;
      setClipPosition(newPosition);
      onPositionChange(newPosition);
      updateClipPosition(newPosition);
    }
  };

  const resetClip = () => {
    const newPosition = 1; // Reset to green (position 1)
    setClipPosition(newPosition);
    onPositionChange(newPosition);
    updateClipPosition(newPosition);
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
      <TouchableOpacity onPress={resetClip} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartContainer: {
    position: 'relative',
    height: 100,
    width: 25,
  },
  colorsContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  colorBlock: {
    height: 25,
    width: '100%',
  },
  clip: {
    position: 'absolute',
    width: '100%',
    height: 25,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 100, // Adjust this value to position the buttons to the left
    top: 25,
  },
  clipButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clipButtonText: {
    fontSize: 20,
    color: '#000000',
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: 'lightcoral',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  resetButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ClipChart;
